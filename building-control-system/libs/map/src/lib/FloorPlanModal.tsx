import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Point, LineString, Polygon } from 'ol/geom';
import Feature from 'ol/Feature';
import { Style, Stroke, Fill, Text, Circle } from 'ol/style';
import { Select, Draw, Snap, Modify } from 'ol/interaction';
import { click } from 'ol/events/condition';
import { Modal, Button, ButtonGroup, Form, Tabs, Tab, Alert, Spinner, Card, Row, Col, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { processDxfFile } from './dxfProcessor';
import ElementDetailModal from './ElementDetailModal';
import ElementPropertiesPanel from './ElementPropertiesPanel';
import { Building, BuildingElement, BuildingElementType, FloorPlan, FloorPlanModalProps } from '../utils/types';

const elementTypes = {
  'outer-wall': { name: 'Dış Duvar', color: '#333', thickness: 5, image: '/images/wall.png' },
  'inner-wall': { name: 'İç Duvar', color: '#666', thickness: 3, image: '/images/wall.png' },
  'door': { name: 'Kapı', color: '#8B4513', thickness: 3, image: '/images/door.png' },
  'window': { name: 'Pencere', color: '#87CEEB', thickness: 2, image: '/images/window.png' },
  'room': { name: 'Oda', color: 'rgba(200, 200, 200, 0.2)', image: '/images/room.png' },
  'furniture': { name: 'Mobilya', color: 'rgba(139, 69, 19, 0.3)', image: '/images/furniture.png' },
  'raf': { name: 'RAF', color: 'rgba(70, 130, 180, 0.3)', image: '/images/shelf.png' },
  'product': { name: 'Ürün', color: '#FF6347', image: '/images/product.png' }
};

const FloorPlanModal: React.FC<FloorPlanModalProps> = ({ building, onClose, onSave }) => {
  const floorPlanRef = useRef<HTMLDivElement>(null);
  const [selectedElement, setSelectedElement] = useState<BuildingElement | null>(null);
  const [floorMap, setFloorMap] = useState<Map | null>(null);
  const [drawingMode, setDrawingMode] = useState<BuildingElementType | null>(null);
  const [elementName, setElementName] = useState('');
  const [activeTab, setActiveTab] = useState('view');
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [buildingState, setBuildingState] = useState(building);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailElement, setDetailElement] = useState<BuildingElement | null>(null);
  const [elementInfo, setElementInfo] = useState<any>(null);

  const createFeatureFromElement = (element: BuildingElement): Feature | null => {
    if (!element.coordinates?.length) return null;

    const geometry = element.type === 'product' ? new Point(element.coordinates[0]) :
      ['room', 'furniture', 'raf'].includes(element.type) ?
        new Polygon([element.coordinates[0] !== element.coordinates[element.coordinates.length-1] ? 
          [...element.coordinates, element.coordinates[0]] : element.coordinates]) :
        new LineString(element.coordinates);

    const feature = new Feature(geometry);
    feature.set('element', element);
    feature.setStyle(getElementStyle(element));
    return feature;
  };

  const getElementStyle = (element: BuildingElement): Style => {
    const baseStyle = {
      stroke: new Stroke({ color: element.color || '#000', width: element.thickness || 1 }),
      fill: new Fill({ color: element.type === 'room' ? 'rgba(200,200,200,0.2)' : 'transparent' }),
      text: new Text({ text: element.name || '', font: '12px Arial', fill: new Fill({ color: '#000' }) })
    };

    return element.type === 'product' ?
      new Style({
        image: new Circle({ radius: 6, fill: new Fill({ color: '#FF6347' }) }),
        text: baseStyle.text
      }) :
      new Style(baseStyle);
  };

  const calculateElementSize = (element: BuildingElement): string => {
    if (!element.coordinates || element.coordinates.length < 2) return '0 m²';
    
    if (element.type === 'product') return 'Nokta eleman';
    
    if (['room', 'furniture', 'raf'].includes(element.type)) {
      // Polygon alan hesaplama
      let area = 0;
      const coords = element.coordinates;
      for (let i = 0; i < coords.length; i++) {
        const j = (i + 1) % coords.length;
        area += coords[i][0] * coords[j][1];
        area -= coords[j][0] * coords[i][1];
      }
      return `${Math.abs(area / 2).toFixed(2)} m²`;
    } else {
      // LineString uzunluk hesaplama
      let length = 0;
      for (let i = 0; i < element.coordinates.length - 1; i++) {
        const dx = element.coordinates[i+1][0] - element.coordinates[i][0];
        const dy = element.coordinates[i+1][1] - element.coordinates[i][1];
        length += Math.sqrt(dx*dx + dy*dy);
      }
      return `${length.toFixed(2)} m`;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave(buildingState);
    setIsSaving(false);
  };

  const handleDeleteElement = () => {
    if (!selectedElement) return;
    
    setBuildingState(prev => ({
      ...prev,
      floors: prev.floors.map((floor, idx) => 
        idx === currentFloor ? {
          ...floor,
          elements: floor.elements.filter(el => el !== selectedElement)
        } : floor
      )
    }));
    setSelectedElement(null);
    setShowDeleteConfirm(false);
    setElementInfo(null);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    try {
      const floorPlan = await processDxfFile(file);
      setBuildingState(prev => ({
        ...prev,
        floors: [...prev.floors, floorPlan]
      }));
    } catch (error) {
      console.error('DXF yükleme hatası:', error);
    }
  };

  const updateBuildingElement = (updates: Partial<BuildingElement>) => {
    if (!selectedElement) return;
    
    setBuildingState(prev => {
      const updatedFloors = [...prev.floors];
      const updatedElements = [...updatedFloors[currentFloor].elements];
      const idx = updatedElements.findIndex(el => el === selectedElement);
      
      if (idx >= 0) {
        const updatedElement = { ...updatedElements[idx], ...updates };
        updatedElements[idx] = updatedElement;
        return {
          ...prev,
          floors: prev.floors.map((f, i) => 
            i === currentFloor ? { ...f, elements: updatedElements } : f
          )
        };
      }
      return prev;
    });
    setSelectedElement(prev => prev ? { ...prev, ...updates } : null);
    if (elementInfo) {
      setElementInfo({
        ...elementInfo,
        name: updates.name || elementInfo.name,
        type: updates.type ? elementTypes[updates.type].name : elementInfo.type
      });
    }
  };

  const updateFloorProperty = <K extends keyof FloorPlan>(key: K, value: FloorPlan[K]) => {
    setBuildingState(prev => ({
      ...prev,
      floors: prev.floors.map((floor, idx) => 
        idx === currentFloor ? { ...floor, [key]: value } : floor
      )
    }));
  };

  const handleDetailSave = (updatedElement: BuildingElement) => {
    updateBuildingElement(updatedElement);
    setShowDetailModal(false);
  };

  const handleElementClick = (element: BuildingElement) => {
    setSelectedElement(element);
    setElementInfo({
      name: element.name,
      type: elementTypes[element.type].name,
      size: calculateElementSize(element),
      image: elementTypes[element.type].image,
      color: element.color,
      thickness: element.thickness
    });
  };

  useEffect(() => {
    if (!floorPlanRef.current) return;
  
    const floor = buildingState.floors[currentFloor];
    const source = new VectorSource();
    
    floor.elements.forEach(element => {
      const feature = createFeatureFromElement(element);
      if (feature) source.addFeature(feature);
    });
  
    const map = new Map({
      target: floorPlanRef.current,
      layers: [new VectorLayer({ source })],
      view: new View({ center: [0, 0], zoom: 25, maxZoom: 50, minZoom: 1 })
    });
  
    if (source.getFeatures().length > 0) {
      map.getView().fit(source.getExtent(), { padding: [50, 50, 50, 50], maxZoom: 25, duration: 0 });
    }
  
    const select = new Select({ 
      condition: click, 
      layers: [new VectorLayer({ source })],
      style: (feature) => {
        const element = feature.get('element') as BuildingElement;
        const style = getElementStyle(element);
        
        if (editMode) {
          const selectedStyle = new Style({
            stroke: new Stroke({ color: '#FF0000', width: (element.thickness || 3) + 2 }),
            fill: new Fill({ color: 'rgba(255, 0, 0, 0.1)' })
          });
          
          if (style.getText()) selectedStyle.setText(style.getText());
          return [style, selectedStyle];
        }
        return style;
      }
    });

    select.on('select', (e) => {
      const selected = e.selected[0]?.get('element') || null;
      setSelectedElement(selected);
      
      if (selected) {
        handleElementClick(selected);
        setDetailElement(selected);
        setShowDetailModal(true);
      }
    });
    
    map.addInteraction(select);

    let modify: Modify | null = null;
    if (editMode) {
      modify = new Modify({
        source: source,
        style: new Style({
          image: new Circle({ radius: 5, fill: new Fill({ color: 'red' }) })
        })
      });

      modify.on('modifyend', (e) => {
        const updatedElements = [...floor.elements];
        
        e.features.getArray().forEach(feature => {
          const element = feature.get('element') as BuildingElement;
          const geometry = feature.getGeometry();
          if (!geometry) return;
          
          const newCoordinates = geometry instanceof Point ? [geometry.getCoordinates()] :
            geometry instanceof LineString ? geometry.getCoordinates() :
            geometry instanceof Polygon ? geometry.getCoordinates()[0] : [];
            
          const index = updatedElements.findIndex(el => el === element);
          if (index >= 0) {
            updatedElements[index] = { ...element, coordinates: newCoordinates };
          }
        });

        setBuildingState(prev => ({
          ...prev,
          floors: prev.floors.map((f, idx) => 
            idx === currentFloor ? { ...f, elements: updatedElements } : f
          )
        }));
      });
      
      map.addInteraction(modify);
    }

    setFloorMap(map);

    return () => {
      if (modify) map.removeInteraction(modify);
      map.removeInteraction(select);
      map.setTarget(undefined);
    };
  }, [buildingState, currentFloor, editMode]);

  useEffect(() => {
    if (!floorMap || !drawingMode) return;
  
    const vectorLayer = floorMap.getLayers().getArray()
      .find(layer => layer instanceof VectorLayer) as VectorLayer<VectorSource>;
    if (!vectorLayer) return;
    
    const source = vectorLayer.getSource();
    const geometryType = 
      ['room', 'furniture', 'raf'].includes(drawingMode) ? 'Polygon' :
      drawingMode === 'product' ? 'Point' : 'LineString';
  
    const draw = new Draw({ 
      source, 
      type: geometryType, 
      style: getElementStyle({ 
        type: drawingMode, 
        coordinates: [],
        color: elementTypes[drawingMode].color,
        thickness: elementTypes[drawingMode].thickness
      }) 
    });
    
    const snap = new Snap({ source });
  
    draw.on('drawend', (e) => {
      const geometry = e.feature.getGeometry();
      const coordinates = geometry instanceof Polygon ? geometry.getCoordinates()[0] :
        geometry instanceof LineString ? geometry.getCoordinates() :
        geometry instanceof Point ? [geometry.getCoordinates()] : [];
  
      const newElement = {
        type: drawingMode,
        coordinates,
        name: elementName || `${elementTypes[drawingMode].name} ${buildingState.floors[currentFloor].elements.length + 1}`,
        color: elementTypes[drawingMode].color,
        thickness: elementTypes[drawingMode].thickness,
        properties: {}
      };
  
      setBuildingState(prev => ({
        ...prev,
        floors: prev.floors.map((floor, idx) => 
          idx === currentFloor ? { ...floor, elements: [...floor.elements, newElement] } : floor
        )
      }));
      
      handleElementClick(newElement);
      setDrawingMode(null);
      setElementName('');
    });
  
    floorMap.addInteraction(draw);
    floorMap.addInteraction(snap);
  
    return () => {
      floorMap.removeInteraction(draw);
      floorMap.removeInteraction(snap);
    };
  }, [drawingMode, floorMap, elementName, currentFloor]);

  const ViewTabContent = () => (
    <div className="p-2">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <ButtonGroup size="sm">
          {buildingState.floors.map((floor, index) => (
            <Button
              key={index}
              variant={currentFloor === index ? 'primary' : 'outline-secondary'}
              onClick={() => setCurrentFloor(index)}
            >
              {floor.level}
            </Button>
          ))}
        </ButtonGroup>
        <Button
          variant={editMode ? 'danger' : 'primary'}
          size="sm"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? 'Düzenlemeyi Durdur' : 'Düzenlemeye Başla'}
        </Button>
      </div>
      {editMode && (
        <Alert variant="warning" className="p-2 mb-2">
          <small>Düzenleme modu aktif. Elemanları taşımak için tıklayıp sürükleyin.</small>
        </Alert>
      )}
    </div>
  );

  const DrawTabContent = () => (
    <div className="p-2">
      <div className="d-flex flex-wrap gap-1 mb-2">
        {Object.keys(elementTypes).map(type => (
          <Button
            key={type}
            variant={drawingMode === type ? 'primary' : 'outline-secondary'}
            onClick={() => setDrawingMode(type as BuildingElementType)}
            size="sm"
          >
            {elementTypes[type].name}
          </Button>
        ))}
      </div>
      {drawingMode && (
        <div className="d-flex align-items-center gap-2 mb-2">
          <Form.Control
            type="text"
            placeholder="Eleman adı girin"
            value={elementName}
            onChange={(e) => setElementName(e.target.value)}
            size="sm"
          />
          <Button variant="danger" onClick={() => setDrawingMode(null)} size="sm">
            İptal
          </Button>
        </div>
      )}
      <Alert variant={drawingMode ? 'info' : 'secondary'} className="p-2 mb-0">
        <small>
          {drawingMode 
            ? `${elementTypes[drawingMode].name} çizim modu aktif. Çizmeye başlamak için kat planına tıklayın.`
            : 'Çizime başlamak için bir eleman türü seçin.'}
        </small>
      </Alert>
    </div>
  );

  const ElementInfoCard = () => (
    <Card className="mt-3">
      <Card.Header className="py-2 bg-primary text-white">
        <h6 className="mb-0">Çizim Bilgileri</h6>
      </Card.Header>
      <Card.Body className="p-2">
        {elementInfo ? (
          <div>
            <Row className="mb-2">
              <Col xs={4} className="d-flex align-items-center">
                <Image src={elementInfo.image} thumbnail className="img-fluid" />
              </Col>
              <Col xs={8}>
                <div><strong>Ad:</strong> {elementInfo.name}</div>
                <div><strong>Tür:</strong> {elementInfo.type}</div>
                <div><strong>Boyut:</strong> {elementInfo.size}</div>
              </Col>
            </Row>
            <div className="d-flex gap-1">
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: elementInfo.color,
                border: '1px solid #000'
              }}></div>
              <small>Renk: {elementInfo.color}</small>
            </div>
            {elementInfo.thickness && (
              <div><small>Kalınlık: {elementInfo.thickness}px</small></div>
            )}
          </div>
        ) : (
          <Alert variant="info" className="mb-0 small">
            Bilgilerini görmek için bir eleman seçin veya yeni çizim yapın.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <>
      <Modal show={true} onHide={onClose} size="xl" centered className="floor-plan-modal">
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>
            {buildingState.name} - {buildingState.floors[currentFloor].level}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-0" style={{ minHeight: '70vh' }}>
          <div className="h-100 d-flex">
            <div className="flex-grow-1 d-flex flex-column">
              <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'view')}>
                <Tab eventKey="view" title="Görünüm">
                  <ViewTabContent />
                </Tab>
                <Tab eventKey="draw" title="Çizim">
                  <DrawTabContent />
                </Tab>
              </Tabs>

              <div className="flex-grow-1 position-relative">
                <div 
                  ref={floorPlanRef} 
                  className="h-100 w-100 bg-light border-top border-bottom"
                />
              </div>
            </div>
            
            <div className="border-start" style={{ width: '350px', minWidth: '350px' }}>
              <ElementPropertiesPanel
                selectedElement={selectedElement}
                elementTypes={elementTypes}
                onUpdateElement={updateBuildingElement}
                onDeleteElement={() => setShowDeleteConfirm(true)}
                currentFloor={currentFloor}
                buildingState={buildingState}
                onUpdateFloorProperty={updateFloorProperty}
              />
              <ElementInfoCard />
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer className="bg-light justify-content-between">
          <div className="d-flex align-items-center">
            <input 
              type="file" 
              id="floorPlanUpload"
              accept=".dxf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
              style={{ display: 'none' }}
            />
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => document.getElementById('floorPlanUpload')?.click()}
            >
              DXF Yükle
            </Button>
          </div>
          
          <Button 
            variant="success" 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </Modal.Footer>
      </Modal>

      <ElementDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        element={detailElement}
        elementTypes={elementTypes}
        onSave={handleDetailSave}
      />
      
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Silme Onayı</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Seçili elemanı silmek istediğinizden emin misiniz?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            İptal
          </Button>
          <Button variant="danger" onClick={handleDeleteElement}>
            Sil
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FloorPlanModal;