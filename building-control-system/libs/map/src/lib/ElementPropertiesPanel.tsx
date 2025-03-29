import { Form, Card, Alert, Button } from 'react-bootstrap';
import { BuildingElement, FloorPlan } from '../utils/types';

interface ElementType {
  name: string;
  color: string;
  thickness?: number;
}

interface ElementPropertiesPanelProps {
  selectedElement: BuildingElement | null;
  elementTypes: Record<string, ElementType>;
  onUpdateElement: (updates: Partial<BuildingElement>) => void;
  onDeleteElement: () => void;
  currentFloor: number;
  buildingState: {
    floors: FloorPlan[];
  };
  onUpdateFloorProperty: (property: 'level' | 'scale', value: string | number) => void;
}

const ElementPropertiesPanel = ({
  selectedElement,
  elementTypes,
  onUpdateElement,
  onDeleteElement,
  currentFloor,
  buildingState,
  onUpdateFloorProperty
}: ElementPropertiesPanelProps) => {
  return (
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
                  onClick={onDeleteElement}
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
                    onChange={(e) => onUpdateElement({ name: e.target.value })}
                    size="sm"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Tür</Form.Label>
                  <Form.Control 
                    as="select"
                    value={selectedElement.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      onUpdateElement({ 
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
                      onChange={(e) => onUpdateElement({ thickness: parseInt(e.target.value) || 0 })}
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
                    value={selectedElement.color || elementTypes[selectedElement.type]?.color || '#000000'}
                    onChange={(e) => onUpdateElement({ color: e.target.value })}
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
              value={buildingState.floors[currentFloor]?.level || ''}
              onChange={(e) => onUpdateFloorProperty('level', e.target.value)}
              size="sm"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Ölçek</Form.Label>
            <Form.Control 
              type="number" 
              value={buildingState.floors[currentFloor]?.scale || 1}
              onChange={(e) => onUpdateFloorProperty('scale', parseFloat(e.target.value) || 1)}
              size="sm"
              step="0.1"
              min="0.1"
              max="10"
            />
          </Form.Group>
        </Form>
      </div>
    </div>
  );
};

export default ElementPropertiesPanel;