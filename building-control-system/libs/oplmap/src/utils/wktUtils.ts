// utils/wktUtils.ts
import { Geometry, Point, LineString, Polygon, Circle } from 'ol/geom';
import { fromCircle } from 'ol/geom/Polygon';

export function geometryToWKT(geometry: Geometry): string {
  if (!geometry) return '';
  
  const type = geometry.getType();
  
  switch (type) {
    case 'Point': {
      const pointCoords = (geometry as Point).getCoordinates();
      return `POINT(${pointCoords.join(' ')})`;
    }

    case 'LineString': {
      const lineCoords = (geometry as LineString).getCoordinates();
      return `LINESTRING(${lineCoords.map(coord => coord.join(' ')).join(', ')})`;
    }

    case 'Polygon': {
      const polyCoords = (geometry as Polygon).getCoordinates();
      return `POLYGON(${polyCoords.map(ring => 
        `(${ring.map(coord => coord.join(' ')).join(', ')})`
      ).join(', ')})`;
    }

    case 'Circle': {
      const circle = geometry as Circle;
      const polygon = fromCircle(circle);
      return geometryToWKT(polygon); 
    }

    default: {
      console.warn(`Unsupported geometry type for WKT: ${type}`);
      return '';
    }
  }
}

export function wktToGeometry(wkt: string): Geometry | null {
  if (!wkt) return null;
  
  try {
    const type = wkt.split('(')[0].toUpperCase();
    const coordStr = wkt.replace(/^[A-Z]+\s*\(|\)$/g, '');
    
    switch (type) {
      case 'POINT': {
        const pointCoords = coordStr.split(' ').map(Number);
        return new Point(pointCoords);
      }

      case 'LINESTRING': {
        const lineCoords = coordStr.split(', ').map(pair => 
          pair.split(' ').map(Number)
        );
        return new LineString(lineCoords);
      }

      case 'POLYGON': {
        const rings = coordStr.split(/\),\s*\(/).map(ring => 
          ring.replace(/[()]/g, '')
              .split(', ')
              .map(pair => pair.split(' ').map(Number))
        );
        return new Polygon(rings);
      }

      default: {
        console.warn(`Unsupported WKT type: ${type}`);
        return null;
      }
    }
  } catch (error) {
    console.error('Error parsing WKT:', error);
    return null;
  }
}
