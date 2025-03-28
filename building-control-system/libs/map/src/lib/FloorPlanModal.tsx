import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Point, LineString, Polygon } from 'ol/geom';
import Feature from 'ol/Feature';
import { Style, Stroke, Fill, Text, Circle } from 'ol/style';
import { Select, Draw, Snap } from 'ol/interaction';
import { click } from 'ol/events/condition';
import { Modal, Button, ButtonGroup, Form, Tabs, Tab, Card, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import DxfParser from 'dxf-parser';
import { Building, BuildingElement, BuildingElementType, FloorPlan, FloorPlanModalProps } from '../utils/types';

const processDxfFile = (file: File): Promise<FloorPlan> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parser = new DxfParser();
        const dxf = parser.parse(e.target?.result as string);
        const elements: BuildingElement[] = [];
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        dxf.entities.forEach((entity: any) => {
          const processCoords = (coords: any) => {
            if (Array.isArray(coords)) {
              coords.forEach(coord => {
                const x = coord.x ?? coord[0] ?? 0;
                const y = coord.y ?? coord[1] ?? 0;
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
              });
            }
          };

          if (entity.type === 'LINE') {
            processCoords([
              { x: entity.startPoint?.x ?? entity.x1 ?? 0, y: entity.startPoint?.y ?? entity.y1 ?? 0 },
              { x: entity.endPoint?.x ?? entity.x2 ?? 0, y: entity.endPoint?.y ?? entity.y2 ?? 0 }
            ]);
          } else if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
            processCoords(entity.vertices || entity.points || []);
          }
        });

        const scaleX = 10 / (maxX - minX || 1);
        const scaleY = 10 / (maxY - minY || 1);
        const scale = Math.min(scaleX, scaleY);

        dxf.entities.forEach((entity: any) => {
          try {
            const normalizeCoord = (coord: any) => {
              const x = coord.x ?? coord[0] ?? 0;
              const y = coord.y ?? coord[1] ?? 0;
              return [(x - minX) * scale, (y - minY) * scale];
            };

            if (entity.type === 'LINE') {
              const start = normalizeCoord({ 
                x: entity.startPoint?.x ?? entity.x1 ?? 0, 
                y: entity.startPoint?.y ?? entity.y1 ?? 0 
              });
              const end = normalizeCoord({ 
                x: entity.endPoint?.x ?? entity.x2 ?? 0, 
                y: entity.endPoint?.y ?? entity.y2 ?? 0 
              });

              elements.push({
                type: 'outer-wall',
                coordinates: [start, end],
                thickness: 5,
                color: '#333'
              });
            }
            else if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
              const vertices = (entity.vertices || entity.points || [])
                .map((v: any) => normalizeCoord({ x: v.x ?? v[0] ?? 0, y: v.y ?? v[1] ?? 0 }))
                .filter(([x, y]: [number, number]) => !isNaN(x) && !isNaN(y));

              if (vertices.length > 2) {
                const isClosed = vertices.length > 2 && 
                  Math.abs(vertices[0][0] - vertices[vertices.length-1][0]) < 0.1 &&
                  Math.abs(vertices[0][1] - vertices[vertices.length-1][1]) < 0.1;

                elements.push({
                  type: isClosed ? 'room' : 'inner-wall',
                  coordinates: isClosed ? [...vertices, vertices[0]] : vertices,
                  color: isClosed ? 'rgba(200, 200, 200, 0.2)' : '#666'
                });
              }
            }
          } catch (error) {
            console.warn(`Error processing entity ${entity.type}:`, error);
          }
        });

        if (elements.length === 0) {
          throw new Error('DXF file contains no valid elements');
        }
        
        resolve({ level: 'DXF Import', scale, elements });
      } catch (error) {
        reject(new Error('DXF parse error: ' + (error instanceof Error ? error.message : String(error))));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
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
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [buildingState, setBuildingState] = useState<Building>(building);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const elementTypes = {
    'outer-wall': { name: 'Dış Duvar', color: '#333', thickness: 5 },
    'inner-wall': { name: 'İç Duvar', color: '#666', thickness: 3 },
    'door': { name: 'Kapı', color: '#8B4513', thickness: 3 },
    'window': { name: 'Pencere', color: '#87CEEB', thickness: 2 },
    'room': { name: 'Oda', color: 'rgba(200, 200, 200, 0.2)' },
    'furniture': { name: 'Mobilya', color: 'rgba(139, 69, 19, 0.3)' },
    'raf': { name: 'RAF', color: 'rgba(70, 130, 180, 0.3)' },
    'product': { name: 'Ürün', color: '#FF6347' }
  };

  const createFeatureFromElement = (element: BuildingElement): Feature | null => {
    try {
      if (!element.coordinates?.length) return null;
  
      let geometry;
      const coords = element.coordinates;
  
      if (element.type === 'product') {
        geometry = new Point(coords[0]);
      } 
      else if (['room', 'furniture', 'raf'].includes(element.type)) {
        const closedCoords = coords[0] !== coords[coords.length-1] ? [...coords, coords[0]] : coords;
        geometry = new Polygon([closedCoords]);
      } 
      else {
        geometry = new LineString(coords);
      }
  
      const feature = new Feature(geometry);
      feature.set('element', element);
      feature.setStyle(getElementStyle(element));
      return feature;
    } catch (error) {
      console.error('Feature creation error:', error);
      return null;
    }
  };

  const getElementStyle = (element: BuildingElement): Style => {
    const styles = {
      'outer-wall': new Style({
        stroke: new Stroke({ color: element.color || '#333', width: element.thickness || 5 })
      }),
      'inner-wall': new Style({
        stroke: new Stroke({ color: element.color || '#666', width: element.thickness || 3, lineDash: [5, 5] })
      }),
      'door': new Style({
        stroke: new Stroke({ color: element.properties?.color || '#8B4513', width: 3 })
      }),
      'window': new Style({
        stroke: new Stroke({ color: '#87CEEB', width: 2 })
      }),
      'room': new Style({
        fill: new Fill({ color: 'rgba(200, 200, 200, 0.2)' }),
        stroke: new Stroke({ color: '#999', width: 1 }),
        text: new Text({ text: element.name || '', font: '12px Arial', fill: new Fill({ color: '#000' }) })
      }),
      'furniture': new Style({
        fill: new Fill({ color: 'rgba(139, 69, 19, 0.3)' }),
        stroke: new Stroke({ color: '#8B4513', width: 1 })
      }),
      'raf': new Style({
        fill: new Fill({ color: 'rgba(70, 130, 180, 0.3)' }),
        stroke: new Stroke({ color: '#4682B4', width: 1 })
      }),
      'product': new Style({
        image: new Circle({ radius: 6, fill: new Fill({ color: '#FF6347' }) }),
        text: new Text({ text: element.name || 'Ürün', font: '10px Arial' })
      })
    };

    return styles[element.type] || new Style({
      stroke: new Stroke({ color: '#000', width: 1 })
    });
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
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      const floorPlan = await processDxfFile(file);
      setBuildingState(prev => ({ ...prev, floors: [...prev.floors, floorPlan] }));
      setUploadProgress(100);
    } catch (error: any) {
      setUploadError(error.message);
    } finally {
      setFileUpload(null);
    }
  };

  const updateBuildingElement = (updates: Partial<BuildingElement>) => {
    setBuildingState(prev => {
      const updatedFloors = [...prev.floors];
      const updatedElements = [...updatedFloors[currentFloor].elements];
      const idx = updatedElements.findIndex(el => el === selectedElement);
      
      if (idx >= 0) {
        updatedElements[idx] = { ...updatedElements[idx], ...updates };
      }
      
      updatedFloors[currentFloor] = {
        ...updatedFloors[currentFloor],
        elements: updatedElements
      };
      
      return { ...prev, floors: updatedFloors };
    });
  };

  const updateFloorProperty = <K extends keyof FloorPlan>(key: K, value: FloorPlan[K]) => {
    setBuildingState(prev => ({
      ...prev,
      floors: prev.floors.map((floor, idx) => 
        idx === currentFloor ? { ...floor, [key]: value } : floor
      )
    }));
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
  
    const select = new Select({ condition: click, layers: [new VectorLayer({ source })] });
    select.on('select', (e) => setSelectedElement(e.selected[0]?.get('element') || null));
    map.addInteraction(select);
    setFloorMap(map);
  
    return () => map.setTarget(undefined);
  }, [buildingState, currentFloor]);

  useEffect(() => {
    if (!floorMap || !drawingMode) return;
  
    const vectorLayer = floorMap.getLayers().getArray()
      .find(layer => layer instanceof VectorLayer) as VectorLayer<VectorSource>;
    if (!vectorLayer) return;
    
    const source = vectorLayer.getSource();
    const geometryType = 
      ['room', 'furniture', 'raf'].includes(drawingMode) ? 'Polygon' :
      drawingMode === 'product' ? 'Point' : 'LineString';
  
    const draw = new Draw({ source, type: geometryType, style: getElementStyle({ type: drawingMode, coordinates: [] }) });
    const snap = new Snap({ source });
  
    draw.on('drawend', (e) => {
      const geometry = e.feature.getGeometry();
      let coordinates: number[][] = [];
  
      if (geometry instanceof Polygon) coordinates = geometry.getCoordinates()[0];
      else if (geometry instanceof LineString) coordinates = geometry.getCoordinates();
      else if (geometry instanceof Point) coordinates = [geometry.getCoordinates()];
  
      const newElement: BuildingElement = {
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

  return (
    <Modal show={true} onHide={onClose} size="xl" centered className="floor-plan-modal">
      <Modal.Header closeButton className="bg-dark text-light py-2">
        <Modal.Title className="h6">
          {buildingState.name} - {buildingState.floors[currentFloor].level}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-0" style={{ minHeight: '70vh' }}>
        <div className="h-100 d-flex">
          <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'view')} className="px-3 pt-2">
              <Tab eventKey="view" title="Görünüm">
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
              </Tab>
              
              <Tab eventKey="draw" title="Çizim">
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
              </Tab>
            </Tabs>

            <div className="flex-grow-1 position-relative">
              <div 
                ref={floorPlanRef} 
                className="h-100 w-100"
                style={{ 
                  backgroundColor: '#e9ecef',
                  borderTop: '1px solid #dee2e6',
                  borderBottom: '1px solid #dee2e6'
                }}
              />
            </div>
          </div>
          
          <div className="border-start" style={{ width: '300px', minWidth: '300px' }}>
            <div className="p-2 border-bottom" style={{ height: '50%' }}>
              <h6 className="mb-2">Eleman Özellikleri</h6>
              {selectedElement ? (
                <Card className="mb-0">
                  <Card.Header className="py-1 px-2 bg-secondary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small">{selectedElement.name || 'İsimsiz Eleman'}</span>
                      <Button 
                        variant="outline-light" 
                        size="sm" 
                        className="p-0"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <small>Sil</small>
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-2 small">
                    <Form>
                      <Form.Group className="mb-2">
                        <Form.Label>Ad</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={selectedElement.name || ''}
                          onChange={(e) => {
                            const newName = e.target.value;
                            setSelectedElement({...selectedElement, name: newName});
                            updateBuildingElement({ name: newName });
                          }}
                          size="sm"
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Tür</Form.Label>
                        <Form.Control 
                          as="select"
                          value={selectedElement.type}
                          onChange={(e) => {
                            const newType = e.target.value as BuildingElementType;
                            setSelectedElement({
                              ...selectedElement, 
                              type: newType,
                              color: elementTypes[newType].color,
                              thickness: elementTypes[newType].thickness
                            });
                            updateBuildingElement({ 
                              type: newType,
                              color: elementTypes[newType].color,
                              thickness: elementTypes[newType].thickness
                            });
                          }}
                          size="sm"
                        >
                          {Object.entries(elementTypes).map(([value, { name }]) => (
                            <option key={value} value={value}>{name}</option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                      {selectedElement.thickness !== undefined && (
                        <Form.Group className="mb-2">
                          <Form.Label>Kalınlık</Form.Label>
                          <Form.Control 
                            type="number" 
                            value={selectedElement.thickness}
                            onChange={(e) => {
                              const thickness = parseInt(e.target.value);
                              setSelectedElement({...selectedElement, thickness});
                              updateBuildingElement({ thickness });
                            }}
                            size="sm"
                            min="1"
                            max="10"
                          />
                        </Form.Group>
                      )}
                      <Form.Group className="mb-2">
                        <Form.Label>Renk</Form.Label>
                        <Form.Control 
                          type="color" 
                          value={selectedElement.color || elementTypes[selectedElement.type].color}
                          onChange={(e) => {
                            setSelectedElement({...selectedElement, color: e.target.value});
                            updateBuildingElement({ color: e.target.value });
                          }}
                          size="sm"
                        />
                      </Form.Group>
                    </Form>
                  </Card.Body>
                </Card>
              ) : (
                <Alert variant="info" className="mb-0 small">
                  Özelliklerini görüntülemek için bir eleman seçin.
                </Alert>
              )}
            </div>
            
            <div className="p-2" style={{ height: '50%' }}>
              <h6 className="mb-2">Kat Bilgileri</h6>
              <Form>
                <Form.Group className="mb-2">
                  <Form.Label>Kat Adı</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={buildingState.floors[currentFloor].level}
                    onChange={(e) => updateFloorProperty('level', e.target.value)}
                    size="sm"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Ölçek</Form.Label>
                  <Form.Control 
                    type="number" 
                    value={buildingState.floors[currentFloor].scale || 1}
                    onChange={(e) => updateFloorProperty('scale', parseFloat(e.target.value))}
                    size="sm"
                    step="0.1"
                    min="0.1"
                    max="10"
                  />
                </Form.Group>
              </Form>
            </div>
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer className="py-2 px-3 bg-light d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <input 
            type="file" 
            id="floorPlanUpload"
            accept=".dxf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFileUpload(file);
                handleFileUpload(file);
              }
            }}
            style={{ display: 'none' }}
          />
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => document.getElementById('floorPlanUpload')?.click()}
            disabled={!!fileUpload}
          >
            DXF Yükle
          </Button>
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="d-inline-flex align-items-center ms-2">
              <Spinner animation="border" size="sm" className="me-2" />
              <small>İşleniyor... %{uploadProgress}</small>
            </div>
          )}
          
          {uploadError && (
            <Alert variant="danger" className="mb-0 ms-2 py-1 small">
              {uploadError}
            </Alert>
          )}
        </div>
        
        <div>
          <Button 
            variant="success" 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </Modal.Footer>

      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} size="sm" centered>
        <Modal.Header closeButton className="py-2 px-3">
          <Modal.Title className="h6">Eleman Sil</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3 small">
          Bu elemanı silmek istediğinizden emin misiniz?
        </Modal.Body>
        <Modal.Footer className="py-2 px-3">
          <Button variant="outline-secondary" size="sm" onClick={() => setShowDeleteConfirm(false)}>
            İptal
          </Button>
          <Button variant="danger" size="sm" onClick={handleDeleteElement}>
            Sil
          </Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
};

export default FloorPlanModal;