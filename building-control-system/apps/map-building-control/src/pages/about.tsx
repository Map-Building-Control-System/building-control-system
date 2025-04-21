import React from 'react';
import dynamic from 'next/dynamic';
import { Container, Row, Col, Card, ListGroup, Modal, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useAppSelector } from '@building-control-system/global-state';

const MapComponent = dynamic(
  () => import('@building-control-system/oplmap').then((mod) => mod.MapComponent),
  { ssr: false }
);

const About = () => {
  // Redux state'ten tüm feature'ları al
  const features = useAppSelector((state) => state.map?.features || []);
  
  // Modal state'leri
  const [showHelpModal, setShowHelpModal] = React.useState(false);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [selectedFeature, setSelectedFeature] = React.useState<any>(null);

  // İstatistikleri hesapla
  const typeCounts = React.useMemo(() => {
    return features.reduce((acc, { type }) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [features]);

  // Detay modalını aç
  const handleShowDetail = (feature: any) => {
    setSelectedFeature(feature);
    setShowDetailModal(true);
  };

  return (
    <Container fluid className="p-0">
      <Row className="m-0">
        <Col xs={12} md={3} className="p-2">
          <Card className="h-100">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <span>Çizim İstatistikleri</span>
                <Badge bg="primary">{features.length}</Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                {Object.entries(typeCounts).map(([type, count]) => (
                  <ListGroup.Item key={type}>
                    <i className={`bi ${getTypeIcon(type)} me-2`}></i>
                    {type}: <Badge bg="secondary">{count}</Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              
              <Card.Header className="mt-3">Çizim Listesi</Card.Header>
              <ListGroup variant="flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {features.map((feature, index) => (
                  <ListGroup.Item 
                    key={index} 
                    action 
                    onClick={() => handleShowDetail(feature)}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <i className={`bi ${getTypeIcon(feature.type)} me-2`}></i>
                      {feature.name || `Çizim ${index + 1}`}
                    </div>
                    <Badge bg="info">{feature.type}</Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={12} md={9} className="p-0">
          <div className="position-relative" style={{ height: 'calc(100vh - 100px)' }}>
            <MapComponent
              center={[34, 39]}
              zoom={6}
              showDrawingTools={true}
              style={{ height: '100%', width: '100%' }}
            />
            
            <button 
              className="btn btn-sm btn-info position-absolute bottom-0 start-0 m-3 p-2"
              onClick={() => setShowHelpModal(true)}
              style={{ fontSize: '10px', borderRadius: '50%' }}
            >
              <i className="bi bi-info-circle"></i> 
            </button>
          </div>
        </Col>
      </Row>

      {/* Yardım Modalı */}
      <Modal show={showHelpModal} onHide={() => setShowHelpModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Yardım</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Harita ile ilgili yardım ve yönergeler burada yer alacak.</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setShowHelpModal(false)}>Kapat</button>
        </Modal.Footer>
      </Modal>

      {/* Çizim Detay Modalı */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className={`bi ${getTypeIcon(selectedFeature?.type)} me-2`}></i>
            {selectedFeature?.name || 'Çizim Detayları'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h6>Tip:</h6>
            <Badge bg="primary">{selectedFeature?.type}</Badge>
          </div>
          
          {selectedFeature?.description && (
            <div className="mb-3">
              <h6>Açıklama:</h6>
              <p>{selectedFeature.description}</p>
            </div>
          )}
          
          <div className="mb-3">
            <h6>Koordinatlar (WKT):</h6>
            <code className="bg-light p-2 d-block text-truncate">
              {selectedFeature?.wkt}
            </code>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Kapat</button>
        </Modal.Footer>
      </Modal>
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