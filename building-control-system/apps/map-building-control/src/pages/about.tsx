import React from 'react';
import dynamic from 'next/dynamic';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useAppSelector } from '@building-control-system/global-state';

const MapComponent = dynamic(
  () => import('@building-control-system/oplmap').then((mod) => mod.MapComponent),
  { ssr: false }
);

const About = () => {
  // Global state'ten çizim tiplerini al
  const drawingTypes = useAppSelector((state) => state.map.drawingTypes);
  
  // Çizim sayılarını hesapla
  const typeCounts = drawingTypes.reduce((acc, { type }) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Container fluid className="p-0">
      <Row className="m-0">
        <Col xs={12} md={4} className="p-2">
          <Card className="h-100">
            <Card.Header>Çizim İstatistikleri</Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {Object.entries(typeCounts).map(([type, count]) => (
                  <ListGroup.Item key={type}>
                    <i className={`bi ${getTypeIcon(type)} me-2`}></i>
                    {type}: {count} adet
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <div className="mt-3">
                Toplam Çizim: {drawingTypes.length}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={12} md={8} className="p-0">
          <div className="position-relative" style={{ height: 'calc(100vh - 80px)' }}>
            <MapComponent
              center={[34, 39]}
              zoom={6}
              showDrawingTools={true}
              style={{ height: '100%', width: '100%' }}
            />
            
            <button 
              className="btn btn-sm btn-info position-absolute bottom-0 end-0 m-3"
              data-bs-toggle="modal" 
              data-bs-target="#infoModal"
            >
              <i className="bi bi-info-circle me-1"></i>
              Yardım
            </button>
          </div>
        </Col>
      </Row>

      {/* Yardım Modalı (aynı) */}
    </Container>
  );
};

// Çizim tipine göre ikon belirleme
function getTypeIcon(type: string) {
  switch(type) {
    case 'Point': return 'bi-geo-alt';
    case 'LineString': return 'bi-slash-lg';
    case 'Polygon': return 'bi-pentagon';
    case 'Circle': return 'bi-circle';
    default: return 'bi-shapes';
  }
}

export default About;