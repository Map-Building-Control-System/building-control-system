import React, { useState } from 'react';
import { Button, Form, Row, Col, Card, Image } from 'react-bootstrap';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';

interface ProductPlacementProps {
  shelfFeature: Feature;
  products: any[];
  productTypes: any;
  onAddProduct: (product: any, position: [number, number]) => void;
  onRemoveProduct: (productId: string) => void;
}

export const ProductPlacement: React.FC<ProductPlacementProps> = ({
  shelfFeature,
  products,
  productTypes,
  onAddProduct,
  onRemoveProduct
}) => {
  const [selectedProductType, setSelectedProductType] = useState('SMALL');
  const [placementMode, setPlacementMode] = useState(false);
  const [shelfImage, setShelfImage] = useState('');

  // Raf geometrisini al
  const geometry = shelfFeature.getGeometry() as Polygon;
  const coordinates = geometry.getCoordinates()[0];
  
  // Raf boyutlarını hesapla
  const shelfWidth = Math.max(...coordinates.map(c => c[0])) - Math.min(...coordinates.map(c => c[0]));
  const shelfHeight = Math.max(...coordinates.map(c => c[1])) - Math.min(...coordinates.map(c => c[1]));

  const handlePlaceProduct = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placementMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Pozisyonu raf koordinat sistemine çevir
    const posX = (x / rect.width) * shelfWidth;
    const posY = (y / rect.height) * shelfHeight;
    
    onAddProduct({ type: selectedProductType }, [posX, posY]);
    setPlacementMode(false);
  };

  return (
    <div className="product-placement">
      <Row>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Header>Ürün Seçimi</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Ürün Türü</Form.Label>
                <Form.Select 
                  value={selectedProductType} 
                  onChange={(e) => setSelectedProductType(e.target.value)}
                >
                  {Object.keys(productTypes).map(key => (
                    <option key={key} value={key}>{productTypes[key].name}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="product-preview mb-3 text-center">
                <Image src={productTypes[selectedProductType].image} thumbnail />
                <div>{productTypes[selectedProductType].name}</div>
                <div className="text-muted small">
                  Boyut: {productTypes[selectedProductType].size.join('x')} cm
                </div>
              </div>

              <Button 
                variant={placementMode ? 'danger' : 'primary'} 
                className="w-100"
                onClick={() => setPlacementMode(!placementMode)}
              >
                {placementMode ? 'Yerleştirmeyi İptal' : 'Ürün Yerleştir'}
              </Button>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>Yerleştirilen Ürünler</Card.Header>
            <Card.Body>
              {products.length === 0 ? (
                <div className="text-muted text-center">Henüz ürün yerleştirilmedi</div>
              ) : (
                <div className="product-list">
                  {products.map(product => (
                    <Card key={product.id} className="mb-2">
                      <Card.Body className="p-2 d-flex align-items-center">
                        <Image 
                          src={productTypes[product.type].image} 
                          width={30} 
                          className="me-2" 
                        />
                        <div>
                          <div>{productTypes[product.type].name}</div>
                          <div className="small text-muted">
                            Pozisyon: {product.position[0].toFixed(1)}, {product.position[1].toFixed(1)}
                          </div>
                        </div>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="ms-auto"
                          onClick={() => onRemoveProduct(product.id)}
                        >
                          Kaldır
                        </Button>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card>
            <Card.Header>
              Raf Üzerinde Ürün Yerleştirme
              {placementMode && (
                <span className="float-end text-danger">
                  Yerleştirme modu aktif - Raf üzerine tıklayın
                </span>
              )}
            </Card.Header>
            <Card.Body className="p-0">
              <div 
                className="shelf-area" 
                onClick={handlePlaceProduct}
                style={{ 
                  height: '500px', 
                  backgroundImage: `url(${shelfImage || '/images/shelf-background.png'})`,
                  backgroundSize: 'cover',
                  position: 'relative',
                  cursor: placementMode ? 'crosshair' : 'default'
                }}
              >
                {products.map(product => (
                  <div
                    key={product.id}
                    style={{
                      position: 'absolute',
                      left: `${(product.position[0] / shelfWidth) * 100}%`,
                      top: `${(product.position[1] / shelfHeight) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      width: `${productTypes[product.type].size[0]}px`,
                      height: `${productTypes[product.type].size[1]}px`
                    }}
                  >
                    <img 
                      src={productTypes[product.type].image} 
                      alt={productTypes[product.type].name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};