// libs/map/PolygonAnalyzer.tsx
import React, { useEffect } from 'react';
import { Polygon } from 'ol/geom';
import { useMapState, useMapDispatch } from './MapContext';

export const PolygonAnalyzer: React.FC = () => {
  const { features } = useMapState();
  const dispatch = useMapDispatch();
  const { polygons, points } = features;

  useEffect(() => {
    if (!polygons.length || !points.length) {
      dispatch({ type: 'SET_POINTS_IN_POLYGON', payload: [] });
      return;
    }

    // En son çizilen poligonu analiz için kullan
    const polygon = polygons[polygons.length - 1];
    const polygonGeometry = polygon.getGeometry();
    
    if (!(polygonGeometry instanceof Polygon)) return;

    const pointsInPolygon = points.filter(point => {
      const pointGeometry = point.getGeometry();
      return pointGeometry && polygonGeometry.intersectsCoordinate(pointGeometry.getCoordinates());
    });

    dispatch({ type: 'SET_POINTS_IN_POLYGON', payload: pointsInPolygon });
  }, [polygons, points, dispatch]);

  return null;
};