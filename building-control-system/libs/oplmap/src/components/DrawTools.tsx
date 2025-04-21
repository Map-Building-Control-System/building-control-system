import React, { useEffect, useRef, useState } from "react";
import { Draw, Snap, Modify, Select } from "ol/interaction";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";
import { Card, Button, ButtonGroup } from 'react-bootstrap';
import { addFeature, useAppDispatch, useAppSelector } from '@building-control-system/global-state';
import WKT from 'ol/format/WKT';
import Feature from 'ol/Feature';
import { click } from 'ol/events/condition';
import FeatureModal from '../modals/FeatureModal';
import { CollapsibleDrawToolsProps } from '../types/CollapsibleDrawToolsProps';
import { FeatureData } from '../types/FeatureData';

const CollapsibleDrawTools = ({ map, vectorSource }: CollapsibleDrawToolsProps) => {
  const dispatch = useAppDispatch();
  const features = useAppSelector((state) => state.map?.features || []);
  const [drawType, setDrawType] = useState<'Point' | 'LineString' | 'Polygon' | 'Circle'>('Point');
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const vectorSourceRef = useRef(vectorSource);
  const drawInteractionRef = useRef<Draw | null>(null);
  const snapInteractionRef = useRef<Snap | null>(null);
  const modifyInteractionRef = useRef<Modify | null>(null);
  const selectInteractionRef = useRef<Select | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<Feature | null>(null);
  const [featureData, setFeatureData] = useState<FeatureData>({
    name: '',
    description: '',
    type: '',
    wkt: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditingGeometry, setIsEditingGeometry] = useState(false);

  // Seçim ve düzenleme interaksiyonlarını ayarla
  useEffect(() => {
    if (!vectorSourceRef.current) {
      console.error('Vektör kaynağı bulunamadı!');
      return;
    }

    // Modify interaksiyonu (her zaman aktif)
    const modify = new Modify({
      source: vectorSourceRef.current,
      style: new Style({
        stroke: new Stroke({ color: 'rgba(0, 0, 255, 0.8)', width: 2 }),
        fill: new Fill({ color: 'rgba(0, 0, 255, 0.2)' }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: 'rgba(0, 0, 255, 0.8)' }),
        }),
      })
    });
    map.addInteraction(modify);
    modifyInteractionRef.current = modify;

    // Select interaksiyonu (her zaman aktif)
    const select = new Select({
      layers: (layer) => layer.get('name') === 'draw-layer',
      condition: click,
      hitTolerance: 5,
      style: new Style({
        stroke: new Stroke({ color: 'rgba(0, 255, 0, 0.8)', width: 3 }),
        fill: new Fill({ color: 'rgba(0, 255, 0, 0.2)' }),
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color: 'rgba(0, 255, 0, 0.8)' }),
        }),
      })
    });

    select.on('select', (e) => {
      if (e.selected.length > 0) {
        const feature = e.selected[0];
        const geometry = feature.getGeometry();
        
        if (geometry) {
          const wktFormat = new WKT();
          const wkt = wktFormat.writeGeometry(geometry);
          
          const storedFeature = findFeatureByGeometry(geometry, features);
          if (storedFeature) {
            setFeatureData({
              name: storedFeature.name,
              description: storedFeature.description,
              type: storedFeature.type,
              wkt: storedFeature.wkt
            });
            setCurrentFeature(feature);
            setIsEditMode(true);
            setIsEditingGeometry(false); // Yeni seçimde düzenleme modu kapalı
            setShowModal(true);
          }
        }
      }
    });

    map.addInteraction(select);
    selectInteractionRef.current = select;

    return () => {
      map.removeInteraction(modify);
      map.removeInteraction(select);
    };
  }, [map, features]);

  // Çizim interaksiyonlarını yönet
  useEffect(() => {
    if (!map || !vectorSourceRef.current) return;

    if (drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
      drawInteractionRef.current = null;
    }
    
    if (snapInteractionRef.current) {
      map.removeInteraction(snapInteractionRef.current);
      snapInteractionRef.current = null;
    }

    if (isDrawingActive) {
      const draw = new Draw({
        source: vectorSourceRef.current,
        type: drawType,
        style: new Style({
          stroke: new Stroke({ color: 'rgba(255, 0, 0, 0.8)', width: 2 }),
          fill: new Fill({ color: 'rgba(255, 0, 0, 0.2)' }),
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color: 'rgba(255, 0, 0, 0.8)' }),
          }),
        }),
      });

      draw.on('drawend', (e) => {
        e.feature.setStyle(undefined);
        const geometry = e.feature.getGeometry();
        
        if (geometry) {
          setCurrentFeature(e.feature);
          const wktFormat = new WKT();
          const wkt = wktFormat.writeGeometry(geometry);
          
          setFeatureData(prev => ({
            ...prev,
            type: geometry.getType(),
            wkt: wkt
          }));
          
          setIsEditMode(false);
          setIsEditingGeometry(false);
          setShowModal(true);
        }
      });
      
      map.addInteraction(draw);
      drawInteractionRef.current = draw;

      const snap = new Snap({ 
        source: vectorSourceRef.current,
        pixelTolerance: 15
      });
      map.addInteraction(snap);
      snapInteractionRef.current = snap;
    }

    return () => {
      if (drawInteractionRef.current) {
        map.removeInteraction(drawInteractionRef.current);
      }
      if (snapInteractionRef.current) {
        map.removeInteraction(snapInteractionRef.current);
      }
    };
  }, [isDrawingActive, drawType, map]);

  // Düzenleme modunu aktifleştir
  const handleEditClick = () => {
    setIsEditingGeometry(true);
    if (modifyInteractionRef.current && currentFeature) {
      modifyInteractionRef.current.setActive(true);
    }
  };

  // Kaydet butonu işlevi
  const handleSubmit = () => {
    if (currentFeature && isEditingGeometry) {
      const geometry = currentFeature.getGeometry();
      if (geometry) {
        const wktFormat = new WKT();
        const wkt = wktFormat.writeGeometry(geometry);
        
        const updatedFeature = {
          ...featureData,
          wkt: wkt
        };
        
        dispatch(updateFeature(updatedFeature));
      }
    } else {
      dispatch(addFeature(featureData));
    }
    
    setShowModal(false);
    setCurrentFeature(null);
    setIsEditingGeometry(false);
    setFeatureData({
      name: '',
      description: '',
      type: '',
      wkt: ''
    });
  };

  // Geometriye göre feature bulma yardımcı fonksiyonu
  const findFeatureByGeometry = (geometry: any, features: FeatureData[]) => {
    const wktFormat = new WKT();
    const wkt = wktFormat.writeGeometry(geometry);
    
    if (geometry.getType() === 'LineString' || geometry.getType() === 'Polygon') {
      const coords = geometry.getCoordinates();
      const firstLastCoords = JSON.stringify([coords[0], coords[coords.length-1]]);
      
      return features.find(f => {
        try {
          const featureGeom = new WKT().readGeometry(f.wkt);
          const fCoords = featureGeom.getCoordinates();
          return JSON.stringify([fCoords[0], fCoords[fCoords.length-1]]) === firstLastCoords;
        } catch {
          return false;
        }
      });
    } else {
      return features.find(f => f.wkt === wkt);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFeatureData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModalClose = () => {
    if (isEditingGeometry && currentFeature) {
      // Düzenleme modunda kapatılırsa değişiklikleri geri al
      const originalWkt = featureData.wkt;
      const originalFeature = new WKT().readFeature(originalWkt);
      currentFeature.setGeometry(originalFeature.getGeometry());
    }
    
    setShowModal(false);
    setCurrentFeature(null);
    setIsEditingGeometry(false);
    setFeatureData({
      name: '',
      description: '',
      type: '',
      wkt: ''
    });
  };

  const clearAll = () => {
    if (vectorSourceRef.current) {
      vectorSourceRef.current.clear();
    }
  };

  return (
    <>
      <Card className="shadow" style={{ width: '280px' }}>
        <Card.Body className="p-2">
          <div className="d-flex flex-column gap-2">
            <ButtonGroup size="sm">
              <Button 
                variant={drawType === 'Point' ? "primary" : "outline-primary"}
                onClick={() => setDrawType('Point')}
              >
                <i className="bi bi-dot"></i> Nokta
              </Button>
              <Button 
                variant={drawType === 'LineString' ? "primary" : "outline-primary"}
                onClick={() => setDrawType('LineString')}
              >
                <i className="bi bi-slash-lg"></i> Çizgi
              </Button>
              <Button 
                variant={drawType === 'Polygon' ? "primary" : "outline-primary"}
                onClick={() => setDrawType('Polygon')}
              >
                <i className="bi bi-pentagon"></i> Poligon
              </Button>
              <Button 
                variant={drawType === 'Circle' ? "primary" : "outline-primary"}
                onClick={() => setDrawType('Circle')}
              >
                <i className="bi bi-circle"></i> Daire
              </Button>
            </ButtonGroup>
            
            <div className="d-flex gap-2">
              <Button 
                variant={isDrawingActive ? "danger" : "success"}
                onClick={() => setIsDrawingActive(!isDrawingActive)}
                className="w-100"
                size="sm"
              >
                <i className={`bi ${isDrawingActive ? "bi-stop-fill" : "bi-play-fill"} me-1`}></i>
                {isDrawingActive ? 'Durdur' : 'Başlat'}
              </Button>
              
              <Button 
                variant="warning"
                onClick={clearAll}
                size="sm"
                title="Tüm çizimleri temizle"
              >
                <i className="bi bi-trash"></i>
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <FeatureModal
        showModal={showModal}
        isEditMode={isEditMode}
        isEditingGeometry={isEditingGeometry}
        featureData={featureData}
        currentFeature={currentFeature}
        vectorSourceRef={vectorSourceRef}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        onEditClick={handleEditClick}
        onInputChange={handleInputChange}
      />
    </>
  );
};

export default CollapsibleDrawTools;