import React from 'react';
import { Polygon } from 'ol/geom';
import { useMap } from '../Map/Map';

export const PolygonAnalyzer: React.FC<{
  polygon: any;
  points: any[];
  onAnalysisComplete?: (pointsInPolygon: any[]) => void;
}> = ({ polygon, points, onAnalysisComplete }) => {
  const map = useMap();

  React.useEffect(() => {
    if (!polygon || !points.length) return;

    const polygonGeometry = polygon.getGeometry();
    if (!(polygonGeometry instanceof Polygon)) return;

    const pointsInPolygon = points.filter(point => {
      const pointGeometry = point.getGeometry();
      return pointGeometry && polygonGeometry.intersectsCoordinate(pointGeometry.getCoordinates());
    });

    if (onAnalysisComplete) onAnalysisComplete(pointsInPolygon);
  }, [polygon, points, onAnalysisComplete]);

  return null;
};