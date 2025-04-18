// libs/map/src/services/map-service.ts
import { Map } from 'ol';
import { Feature } from 'ol';
import { Point, Polygon } from 'ol/geom';

export class MapService {
  private map: Map;

  constructor(map: Map) {
    this.map = map;
  }

  findPointsInPolygon(polygon: Polygon, pointFeatures: Feature<Point>[]): Feature<Point>[] {
    return pointFeatures.filter((feature) => {
      const geometry = feature.getGeometry();
      return geometry && polygon.intersectsCoordinate(geometry.getCoordinates());
    });
  }

  // Diğer yardımcı fonksiyonlar...
}