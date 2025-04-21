import React, { useEffect, useRef, useState } from "react";
import { Draw, Snap, Modify } from "ol/interaction";
import VectorSource from "ol/source/Vector";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";
import { Map } from "ol";
import { Card, Button, ButtonGroup } from 'react-bootstrap';
// import { useAppDispatch, useAppSelector } from '@building-control-system/global-state';
import { addFeature, useAppDispatch } from '@building-control-system/global-state';

interface CollapsibleDrawToolsProps {
  map: Map;
}

const CollapsibleDrawTools = ({ map }: CollapsibleDrawToolsProps) => {

 const dispatch = useAppDispatch();
 

  const [drawType, setDrawType] = useState<'Point' | 'LineString' | 'Polygon' | 'Circle'>('Point');
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const drawInteractionRef = useRef<Draw | null>(null);
  const snapInteractionRef = useRef<Snap | null>(null);
  const modifyInteractionRef = useRef<Modify | null>(null);

  useEffect(() => {
    map.getLayers().forEach(layer => {
      if (layer.get('name') === 'draw-layer') {
        vectorSourceRef.current = layer.getSource();
      }
    });

    if (!vectorSourceRef.current) {
      console.error('Vektör kaynağı bulunamadı!');
    }
    
    const modify = new Modify({
      source: vectorSourceRef.current || undefined
    });
    map.addInteraction(modify);
    modifyInteractionRef.current = modify;
    
    return () => {
      if (modifyInteractionRef.current) {
        map.removeInteraction(modifyInteractionRef.current);
      }
    };
  }, [map]);

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
      ;
      draw.on('drawend', (e) => {
        e.feature.setStyle(undefined);
        const geometry = e.feature.getGeometry();
        
        if (geometry) {
          // Sadece geometri tipini dispatch ediyoruz
          dispatch(addFeature({
            type: geometry.getType() // "Point", "LineString", "Polygon" veya "Circle"
          }));
          
          console.log("Çizim tipi:", geometry.getType());
        }
      });
      map.addInteraction(draw);
      drawInteractionRef.current = draw;

      const snap = new Snap({ source: vectorSourceRef.current });
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

  const clearAll = () => {
    if (vectorSourceRef.current) {
      vectorSourceRef.current.clear();
    }
  };

  return (
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
            >
              <i className="bi bi-trash"></i>
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CollapsibleDrawTools;