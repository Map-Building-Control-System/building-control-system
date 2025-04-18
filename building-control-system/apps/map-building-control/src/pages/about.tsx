import React from 'react';
import dynamic from 'next/dynamic';
import { Container, Row, Col, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Bootstrap ikonlarını ekleyin

// MapComponent'i SSR sorunlarını önlemek için dinamik olarak import et
const MapComponent = dynamic(
  () => import('@building-control-system/oplmap').then((mod) => mod.MapComponent),
  { ssr: false }
);

const About = () => {
  return (
    <Container fluid className="p-0">
      <Row className="m-0">
        <Col xs={12} className="p-0">
          {/* Ana harita konteyner */}
          <div className="position-relative" style={{ height: 'calc(100vh - 80px)' }}>
            <MapComponent
              center={[34, 39]}
              zoom={6}
              showDrawingTools={true}
              style={{ height: '100%', width: '100%' }}
            />
            
            {/* Bilgi butonu - isteğe bağlı */}
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

      {/* Yardım Modalı */}
      <div className="modal fade" id="infoModal" tabIndex={-1} aria-labelledby="infoModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="infoModalLabel">Kullanım Kılavuzu</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <ul>
                <li>Çizim araçları butonu ile harita üzerine şekiller ekleyin</li>
                <li>Poligon seçerek içindeki diğer çizimleri analiz edin</li>
                <li>Yakınlaştırma butonu ile seçili alana odaklanın</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default About;