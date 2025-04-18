// ProductDetailModal.tsx
import React, { useState,useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { Product } from '../utils/types';

interface ProductDetailModalProps {
  show: boolean;
  onHide: () => void;
  product: Product | null;
  onSave: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ show, onHide, product, onSave }) => {
  const [editedProduct, setEditedProduct] = useState<Product>(product || {
    id: 0,
    name: '',
    code: '',
    quantity: 1,
    color: '#FF6347'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setEditedProduct(product);
    } else {
      setEditedProduct({
        id: Date.now(),
        name: '',
        code: '',
        quantity: 1,
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!editedProduct.name.trim()) {
      newErrors.name = 'Ürün adı gereklidir';
    }
    
    if (!editedProduct.code.trim()) {
      newErrors.code = 'Ürün kodu gereklidir';
    }
    
    if (editedProduct.quantity <= 0) {
      newErrors.quantity = 'Geçerli bir miktar girin';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(editedProduct);
      onHide();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedProduct({ ...editedProduct, color: e.target.value });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Ürün Adı</Form.Label>
            <Form.Control
              type="text"
              value={editedProduct.name}
              onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Ürün Kodu</Form.Label>
                <Form.Control
                  type="text"
                  value={editedProduct.code}
                  onChange={(e) => setEditedProduct({ ...editedProduct, code: e.target.value })}
                  isInvalid={!!errors.code}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.code}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Miktar</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={editedProduct.quantity}
                  onChange={(e) => setEditedProduct({ ...editedProduct, quantity: parseInt(e.target.value) || 0 })}
                  isInvalid={!!errors.quantity}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.quantity}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Renk</Form.Label>
            <div className="d-flex align-items-center gap-3">
              <Form.Control
                type="color"
                value={editedProduct.color}
                onChange={handleColorChange}
                style={{ width: '80px', height: '40px', padding: '3px' }}
              />
              <span>{editedProduct.color}</span>
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          İptal
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Kaydet
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductDetailModal;