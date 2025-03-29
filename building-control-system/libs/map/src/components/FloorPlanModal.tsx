import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FloorPlanModalProps } from '../utils/types';

const FloorPlanModal: React.FC<FloorPlanModalProps> = ({ 
  building, 
  onClose, 
  onSave 
}) => {
  return (
    <Modal show={true} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>{building.name} Kat Planı</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div style={{ minHeight: '400px' }}>
          {/* Kat planı içeriği buraya gelecek */}
          <p>Kat planı görüntüleme ve düzenleme alanı</p>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Kapat
        </Button>
        <Button variant="primary" onClick={onSave}>
          Kaydet
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FloorPlanModal;