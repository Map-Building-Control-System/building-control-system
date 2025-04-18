import React, { useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';

interface ShelfDesignerProps {
  shelfType: string;
  sections: number;
  onSave: (design: any) => void;
}

export const ShelfDesigner: React.FC<ShelfDesignerProps> = ({ shelfType, sections, onSave }) => {
  const [layout, setLayout] = useState('horizontal');
  const [sectionHeight, setSectionHeight] = useState(40);
  const [sectionWidth, setSectionWidth] = useState(100);
  const [labelPosition, setLabelPosition] = useState('top');

  const handleSave = () => {
    onSave({
      layout,
      sectionHeight,
      sectionWidth,
      labelPosition
    });
  };

  return (
    <div className="shelf-designer">
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Raf Düzeni</Form.Label>
            <Form.Select value={layout} onChange={(e) => setLayout(e.target.value)}>
              <option value="horizontal">Yatay</option>
              <option value="vertical">Dikey</option>
              <option value="grid">Izgara</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Etiket Pozisyonu</Form.Label>
            <Form.Select value={labelPosition} onChange={(e) => setLabelPosition(e.target.value)}>
              <option value="top">Üst</option>
              <option value="bottom">Alt</option>
              <option value="left">Sol</option>
              <option value="right">Sağ</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Bölüm Yüksekliği (cm)</Form.Label>
            <Form.Control 
              type="number" 
              value={sectionHeight} 
              onChange={(e) => setSectionHeight(parseInt(e.target.value))} 
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Bölüm Genişliği (cm)</Form.Label>
            <Form.Control 
              type="number" 
              value={sectionWidth} 
              onChange={(e) => setSectionWidth(parseInt(e.target.value))} 
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="design-preview mb-3 p-3 border rounded">
        <div className="text-center text-muted">
          Raf Tasarım Önizlemesi ({sections} bölüm)
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <Button variant="primary" onClick={handleSave}>
          Tasarımı Kaydet
        </Button>
      </div>
    </div>
  );
};