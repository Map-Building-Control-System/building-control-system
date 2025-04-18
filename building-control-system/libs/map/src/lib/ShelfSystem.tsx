import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card, Dropdown, Image, Alert } from 'react-bootstrap';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { ShelfDesigner } from './ShelfDesigner';
import { ProductPlacement } from './ProductPlacement';

// Raf türleri ve özellikleri
export const SHELF_TYPES = {
  STANDARD: {
    name: 'Standart Raf',
    capacity: 20,
    sectionHeight: 40,
    sectionWidth: 100,
    maxWeight: 50,
    image: '/images/standard-shelf.png'
  },
  PALLET: {
    name: 'Palet Rafı',
    capacity: 10,
    sectionHeight: 100,
    sectionWidth: 120,
    maxWeight: 200,
    image: '/images/pallet-shelf.png'
  },
  DISPLAY: {
    name: 'Vitrin Rafı',
    capacity: 15,
    sectionHeight: 30,
    sectionWidth: 80,
    maxWeight: 20,
    image: '/images/display-shelf.png'
  }
};

// Ürün tipleri
export const PRODUCT_TYPES = {
  SMALL: { name: 'Küçük Ürün', size: [20, 20], image: '/images/small-product.png' },
  MEDIUM: { name: 'Orta Ürün', size: [40, 40], image: '/images/medium-product.png' },
  LARGE: { name: 'Büyük Ürün', size: [60, 60], image: '/images/large-product.png' }
};

interface ShelfSystemProps {
  feature: Feature;
  onUpdate: (feature: Feature) => void;
  onDelete: () => void;
}

export const ShelfSystem: React.FC<ShelfSystemProps> = ({ feature, onUpdate, onDelete }) => {
  const [showDesigner, setShowDesigner] = useState(false);
  const [showPlacement, setShowPlacement] = useState(false);
  const [shelfType, setShelfType] = useState('STANDARD');
  const [sections, setSections] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Raf özelliklerini feature'dan al
  useEffect(() => {
    const element = feature.get('element');
    if (element?.properties) {
      setShelfType(element.properties.shelfType || 'STANDARD');
      setSections(element.properties.sections || 1);
      setProducts(element.properties.products || []);
    }
  }, [feature]);

  // Raf özelliklerini güncelle
  const updateShelfProperties = () => {
    const element = feature.get('element');
    const geometry = feature.getGeometry() as Polygon;
    const coordinates = geometry.getCoordinates()[0];
    
    const updatedElement = {
      ...element,
      properties: {
        ...element.properties,
        shelfType,
        sections,
        products,
        capacity: SHELF_TYPES[shelfType].capacity * sections
      }
    };
    
    feature.set('element', updatedElement);
    onUpdate(feature);
  };

  // Raf türünü değiştir
  const handleShelfTypeChange = (type: string) => {
    setShelfType(type);
    setProducts([]);
  };

  // Bölüm sayısını değiştir
  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
    setSections(value);
  };

  // Ürün ekle
  const addProduct = (product: any, position: [number, number]) => {
    const newProduct = {
      ...product,
      position,
      id: Date.now().toString()
    };
    setProducts([...products, newProduct]);
  };

  // Ürün kaldır
  const removeProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  // Rafı sil
  const confirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="shelf-system">
      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Raf Yönetimi</h5>
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={() => setShowDeleteConfirm(true)}
          >
            Rafı Sil
          </Button>
        </Card.Header>
        
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Raf Türü</Form.Label>
                <Dropdown onSelect={handleShelfTypeChange}>
                  <Dropdown.Toggle variant="outline-secondary" className="w-100">
                    {SHELF_TYPES[shelfType].name}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {Object.keys(SHELF_TYPES).map(key => (
                      <Dropdown.Item key={key} eventKey={key} active={shelfType === key}>
                        {SHELF_TYPES[key].name} (Kapasite: {SHELF_TYPES[key].capacity * sections})
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Bölüm Sayısı</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="10"
                  value={sections}
                  onChange={handleSectionChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2 mb-3">
            <Button variant="primary" onClick={() => setShowDesigner(true)}>
              Rafı Özelleştir
            </Button>
            <Button variant="success" onClick={() => setShowPlacement(true)}>
              Ürün Yerleştir
            </Button>
          </div>

          <Alert variant="info" className="small">
            <strong>Kapasite:</strong> {products.length} / {SHELF_TYPES[shelfType].capacity * sections} ürün
          </Alert>

          {products.length > 0 && (
            <div className="product-list">
              <h6>Yerleştirilen Ürünler</h6>
              <div className="d-flex flex-wrap gap-2">
                {products.map(product => (
                  <Card key={product.id} className="product-item">
                    <Card.Body className="p-2 d-flex align-items-center">
                      <Image src={PRODUCT_TYPES[product.type].image} width={30} className="me-2" />
                      <div>
                        <div className="small">{PRODUCT_TYPES[product.type].name}</div>
                        <div className="text-muted small">Pozisyon: {product.position.join(', ')}</div>
                      </div>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="ms-auto"
                        onClick={() => removeProduct(product.id)}
                      >
                        Kaldır
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Card.Body>

        <Card.Footer className="d-flex justify-content-end">
          <Button variant="primary" onClick={updateShelfProperties}>
            Değişiklikleri Kaydet
          </Button>
        </Card.Footer>
      </Card>

      {/* Raf Tasarım Modalı */}
      <Modal show={showDesigner} onHide={() => setShowDesigner(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Raf Tasarımı</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ShelfDesigner 
            shelfType={shelfType} 
            sections={sections} 
            onSave={(design) => {
              // Tasarım bilgilerini kaydet
              setShowDesigner(false);
            }} 
          />
        </Modal.Body>
      </Modal>

      {/* Ürün Yerleştirme Modalı */}
      <Modal show={showPlacement} onHide={() => setShowPlacement(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Ürün Yerleştirme</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProductPlacement
            shelfFeature={feature}
            products={products}
            productTypes={PRODUCT_TYPES}
            onAddProduct={addProduct}
            onRemoveProduct={removeProduct}
          />
        </Modal.Body>
      </Modal>

      {/* Silme Onay Modalı */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Rafı Sil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bu rafı ve içindeki tüm ürünleri silmek istediğinizden emin misiniz?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            İptal
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Sil
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};