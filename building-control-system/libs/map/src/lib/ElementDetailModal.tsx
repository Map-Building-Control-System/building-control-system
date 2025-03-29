import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { BuildingElement } from '../utils/types';

interface ElementType {
  name: string;
  color: string;
  thickness?: number;
}

interface ElementDetailModalProps {
  show: boolean;
  element: BuildingElement | null;
  elementTypes: Record<string, ElementType>;
  onHide: () => void;
  onSave: (updatedElement: BuildingElement) => void;
}

const ElementDetailModal: React.FC<ElementDetailModalProps> = ({ 
  show, 
  element, 
  elementTypes,
  onHide, 
  onSave 
}) => {
  const [localElement, setLocalElement] = useState<BuildingElement | null>(null);

  useEffect(() => {
    if (element) {
      setLocalElement({...element});
    }
  }, [element]);

  const handleChange = (field: keyof BuildingElement, value: any) => {
    if (localElement) {
      setLocalElement({
        ...localElement,
        [field]: value
      });
    }
  };

  if (!localElement) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered style={{ zIndex: 1060 }}>
      <Modal.Header closeButton>
        <Modal.Title>Element Detayı - {localElement.name || 'İsimsiz'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Ad</Form.Label>
            <Form.Control 
              type="text" 
              value={localElement.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tür</Form.Label>
            <Form.Control
              as="select"
              value={localElement.type}
              onChange={(e) => {
                const newType = e.target.value;
                handleChange('type', newType);
                handleChange('color', elementTypes[newType]?.color || '#000000');
                if (elementTypes[newType]?.thickness !== undefined) {
                  handleChange('thickness', elementTypes[newType]?.thickness);
                }
              }}
            >
              {Object.entries(elementTypes).map(([key, type]) => (
                <option key={key} value={key}>{type.name}</option>
              ))}
            </Form.Control>
          </Form.Group>

          {localElement.thickness !== undefined && (
            <Form.Group className="mb-3">
              <Form.Label>Kalınlık</Form.Label>
              <Form.Control
                type="number"
                value={localElement.thickness}
                onChange={(e) => handleChange('thickness', parseInt(e.target.value) || 0)}
                min="1"
                max="10"
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Renk</Form.Label>
            <Form.Control
              type="color"
              value={localElement.color || elementTypes[localElement.type]?.color || '#000000'}
              onChange={(e) => handleChange('color', e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Kapat</Button>
        <Button variant="primary" onClick={() => localElement && onSave(localElement)}>
          Kaydet
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ElementDetailModal;