import React, { useEffect, useState, useRef } from "react";
import { Map } from "ol";
import { Draw } from "ol/interaction";
import VectorSource from "ol/source/Vector";
import { Polygon } from "ol/geom";
import { Feature } from "ol";
import { containsExtent } from "ol/extent";
import Geometry from "ol/geom/Geometry";
import { Style, Stroke, Fill } from "ol/style";
import { Button, Badge, Card } from 'react-bootstrap';

interface CollapsiblePolygonAnalyzerProps {
  map: Map;
  vectorSource: VectorSource | null;
}

const CollapsiblePolygonAnalyzer = ({ map, vectorSource }: CollapsiblePolygonAnalyzerProps) => {
  const [selectedPolygon, setSelectedPolygon] = useState<Feature<Polygon> | null>(null);
  const [featuresInsidePolygon, setFeaturesInsidePolygon] = useState<Feature<Geometry>[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const drawInteractionRef = useRef<Draw | null>(null);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (drawInteractionRef.current) {
        map.removeInteraction(drawInteractionRef.current);
      }
    };
  }, [map]);

  const findFeaturesInsidePolygon = (polygonFeature: Feature<Polygon>) => {
    if (!vectorSource) return;

    const polygon = polygonFeature.getGeometry();
    if (!polygon) return;

    const polygonExtent = polygon.getExtent();
    const features = vectorSource.getFeatures();
    const insideFeatures: Feature<Geometry>[] = [];
    
    features.forEach(feature => {
      if (feature === polygonFeature) return;
      
      const geometry = feature.getGeometry();
      if (geometry) {
        const featureExtent = geometry.getExtent();
        if (containsExtent(polygonExtent, featureExtent)) {
          insideFeatures.push(feature);
        }
      }
    });
    
    setFeaturesInsidePolygon(insideFeatures);
  };

  const selectPolygon = () => {
    if (!vectorSource) return;
    
    if (drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
    }
    
    setIsDrawing(true);
    
    const draw = new Draw({
      source: vectorSource,
      type: 'Polygon',
      style: new Style({
        stroke: new Stroke({ color: 'rgba(255, 0, 0, 0.8)', width: 3 }),
        fill: new Fill({ color: 'rgba(255, 0, 0, 0.3)' }),
      }),
    });

    draw.on('drawend', (e) => {
      const polygon = e.feature as Feature<Polygon>;
      setSelectedPolygon(polygon);
      findFeaturesInsidePolygon(polygon);
      map.removeInteraction(draw);
      setIsDrawing(false);
      
      polygon.setStyle(
        new Style({
          stroke: new Stroke({ color: 'rgba(0, 123, 255, 0.9)', width: 3 }),
          fill: new Fill({ color: 'rgba(0, 123, 255, 0.2)' }),
        })
      );
    });

    map.addInteraction(draw);
    drawInteractionRef.current = draw;
  };

  const zoomToSelected = () => {
    if (selectedPolygon) {
      const polygon = selectedPolygon.getGeometry();
      if (polygon) {
        const extent = polygon.getExtent();
        map.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 500
        });
      }
    }
  };

  const clearSelection = () => {
    if (selectedPolygon && vectorSource) {
      vectorSource.removeFeature(selectedPolygon);
    }
    setSelectedPolygon(null);
    setFeaturesInsidePolygon([]);
  };

  return (
    <Card className="shadow" style={{ width: '280px' }}>
      <Card.Body className="p-2">
        <div className="d-flex flex-column gap-2">
          <Button 
            variant={isDrawing ? "secondary" : "primary"}
            onClick={selectPolygon}
            size="sm"
            disabled={isDrawing}
            className="w-100"
          >
            <i className="bi bi-pentagon me-1"></i> 
            {isDrawing ? "Çiziliyor..." : "Poligon Seç"}
          </Button>

          <div className="d-flex gap-2">
            <Button 
              variant="info"
              onClick={zoomToSelected}
              disabled={!selectedPolygon}
              size="sm"
              className="w-50"
            >
              <i className="bi bi-zoom-in me-1"></i> Yakınlaştır
            </Button>
            <Button 
              variant="danger"
              onClick={clearSelection}
              disabled={!selectedPolygon}
              size="sm"
              className="w-50"
            >
              <i className="bi bi-x-circle me-1"></i> Temizle
            </Button>
          </div>

          {featuresInsidePolygon.length > 0 && (
            <div className="mt-2 p-2 border rounded bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <small className="fw-bold">Poligon içindeki öğeler:</small>
                <Badge bg="success">{featuresInsidePolygon.length}</Badge>
              </div>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default CollapsiblePolygonAnalyzer;