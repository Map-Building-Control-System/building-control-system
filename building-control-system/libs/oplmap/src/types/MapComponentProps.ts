import { Map } from "ol";

export interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  style?: React.CSSProperties;
  className?: string;
  onMapInit?: (map: Map) => void;
  showDrawingTools?: boolean;
}