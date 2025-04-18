// libs/map/src/utils/olUtils.ts
import { Feature } from 'ol';
import { Geometry, Point, Polygon } from 'ol/geom';

export function isPointInPolygon(point: Feature<Point>, polygon: Feature<Polygon>): boolean {
  const pointGeom = point.getGeometry();
  const polyGeom = polygon.getGeometry();
  
  if (!pointGeom || !polyGeom) return false;
  
  return polyGeom.intersectsCoordinate(pointGeom.getCoordinates());
}