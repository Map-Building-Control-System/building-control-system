// libs/map/src/types/map-types.ts
import { Map } from 'ol';
import { Geometry } from 'ol/geom';

export interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  children?: React.ReactNode;
  onMapInit?: (map: Map) => void;
}

export interface FeatureInfo {
  id: string;
  geometry: Geometry;
  properties: Record<string, any>;
}