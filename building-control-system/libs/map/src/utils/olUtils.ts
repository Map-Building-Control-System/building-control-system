// libs/map/src/utils/olUtils.ts
import { Feature } from 'ol';
import { Geometry, Point, Polygon } from 'ol/geom';
import { fromLonLat, toLonLat } from 'ol/proj';

export function isPointInPolygon(point: Feature<Point>, polygon: Feature<Polygon>): boolean {
  const pointGeom = point.getGeometry();
  const polyGeom = polygon.getGeometry();
  
  if (!pointGeom || !polyGeom) return false;
  
  return polyGeom.intersectsCoordinate(pointGeom.getCoordinates());
}

export function convertToLonLat(coordinate: [number, number]): [number, number] {
  return toLonLat(coordinate);
}

export function convertFromLonLat(coordinate: [number, number]): [number, number] {
  return fromLonLat(coordinate);
}