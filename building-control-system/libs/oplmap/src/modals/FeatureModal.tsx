import React from 'react';
import { Modal, Form, Badge, Button } from 'react-bootstrap';
import Feature from 'ol/Feature';
import VectorSource from "ol/source/Vector";
import WKT from 'ol/format/WKT';

interface FeatureData {
  name: string;
  description: string;
  type: string;
  wkt: string;
}

interface FeatureModalProps {
  showModal: boolean;
  isEditMode: boolean;
  isEditingGeometry: boolean;
  featureData: FeatureData;
  currentFeature: Feature | null;
  vectorSourceRef: React.MutableRefObject<VectorSource | null>;
  onClose: () => void;
  onSubmit: () => void;
  onEditClick: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const FeatureModal: React.FC<FeatureModalProps> = ({
  showModal,
  isEditMode,
  isEditingGeometry,
  featureData,
  currentFeature,
  vectorSourceRef,
  onClose,
  onSubmit,
  onEditClick,
  onInputChange
}) => {
  const handleModalClose = () => {
    if ((!isEditMode || isEditingGeometry) && currentFeature && vectorSourceRef.current) {
      // Düzenleme modunda veya yeni çizimde kapatılırsa değişiklikleri geri al
      if (isEditingGeometry) {
        const originalWkt = featureData.wkt;
        const originalFeature = new WKT().readFeature(originalWkt);
        currentFeature.setGeometry(originalFeature.getGeometry());
      } else if (!isEditMode) {
        vectorSourceRef.current.removeFeature(currentFeature);
      }
    }
    onClose();
  };

  return (
    <Modal show={showModal} onHide={handleModalClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditMode ? (isEditingGeometry ? 'Çizim Düzenleme' : 'Çizim Detayları') : 'Yeni Çizim'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>İsim</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={featureData.name}
              onChange={onInputChange}
              placeholder="Çizim ismi girin"
              readOnly={isEditMode && !isEditingGeometry}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Açıklama</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={featureData.description}
              onChange={onInputChange}
              rows={3}
              placeholder="Çizim açıklaması girin"
              readOnly={isEditMode && !isEditingGeometry}
            />
          </Form.Group>
          <div className="mb-3">
            <Form.Label>Tip:</Form.Label>
            <Badge bg="primary" className="ms-2">
              {featureData.type}
            </Badge>
          </div>
          {isEditMode && (
            <div className="mb-3">
              <Form.Label>Koordinatlar (WKT):</Form.Label>
              <div className="bg-light p-2 rounded">
                <code className="text-wrap">
                  {featureData.wkt}
                </code>
              </div>
            </div>
          )}
        </Form>
        {isEditingGeometry && (
          <div className="alert alert-info mt-3">
            <i className="bi bi-info-circle"></i> Çizimi harita üzerinde sürükleyerek düzenleyebilirsiniz.
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose}>
          Kapat
        </Button>
        {isEditMode && !isEditingGeometry && (
          <Button variant="primary" onClick={onEditClick}>
            <i className="bi bi-pencil"></i> Düzenle
          </Button>
        )}
        {(!isEditMode || isEditingGeometry) && (
          <Button variant="success" onClick={onSubmit}>
            <i className="bi bi-check"></i> {isEditingGeometry ? 'Güncelle' : 'Kaydet'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default FeatureModal;