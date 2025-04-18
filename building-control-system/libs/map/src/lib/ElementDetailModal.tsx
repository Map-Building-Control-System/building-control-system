import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { BuildingElement } from '../utils/types';

interface ElementType {
  name: string;
  color: string;
  thickness?: number;
  image?: string;
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
  const [errors, setErrors] = useState<{name?: string}>({});

  // Eleman değiştiğinde local state'i güncelle
  useEffect(() => {
    setLocalElement(element ? {...element} : null);
    setErrors({});
  }, [element]);

  // Alan değişikliklerini işle
  const handleChange = (field: keyof BuildingElement, value: any) => {
    if (localElement) {
      setLocalElement({
        ...localElement,
        [field]: value
      });

      // Validasyon
      if (field === 'name') {
        setErrors({
          ...errors,
          name: value.trim() ? undefined : 'Bu alan zorunludur'
        });
      }
    }
  };

  // Kaydet butonu için validasyon
  const validateAndSave = () => {
    if (!localElement) return;

    if (!localElement.name?.trim()) {
      setErrors({name: 'Bu alan zorunludur'});
      return;
    }

    onSave(localElement);
    onHide();
  };

  if (!localElement) return null;

  const currentType = elementTypes[localElement.type] || {};
  const defaultColor = currentType.color || '#000000';

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          <i className="fas fa-edit me-2"></i>
          {currentType.name} Düzenleme - {localElement.name || 'İsimsiz Eleman'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Eleman Adı</Form.Label>
                <Form.Control
                  type="text"
                  value={localElement.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  isInvalid={!!errors.name}
                  placeholder="Eleman adı giriniz"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Eleman Türü</Form.Label>
                <Form.Select
                  value={localElement.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    handleChange('type', newType);
                    handleChange('color', elementTypes[newType]?.color || defaultColor);
                    if (elementTypes[newType]?.thickness !== undefined) {
                      handleChange('thickness', elementTypes[newType]?.thickness);
                    }
                  }}
                >
                  {Object.entries(elementTypes).map(([key, type]) => (
                    <option key={key} value={key}>{type.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            {localElement.thickness !== undefined && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Kalınlık (px)</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      value={localElement.thickness}
                      onChange={(e) => handleChange('thickness', parseInt(e.target.value) || 1)}
                      min="1"
                      max="20"
                    />
                    <InputGroup.Text>px</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
            )}
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Renk Seçimi</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type="color"
                    className="form-control-color"
                    value={localElement.color || defaultColor}
                    onChange={(e) => handleChange('color', e.target.value)}
                    title="Renk seçin"
                  />
                  <span className="ms-2">{localElement.color || defaultColor}</span>
                </div>
              </Form.Group>
            </Col>
          </Row>

          {currentType.image && (
            <div className="text-center mt-3">
              <img 
                src={currentType.image} 
                alt={currentType.name} 
                style={{ maxWidth: '100px', opacity: 0.7 }}
                className="img-thumbnail"
              />
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>
          <i className="fas fa-times me-2"></i>Vazgeç
        </Button>
        <Button 
          variant="primary" 
          onClick={validateAndSave}
          disabled={!!errors.name}
        >
          <i className="fas fa-save me-2"></i>Kaydet
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ElementDetailModal;