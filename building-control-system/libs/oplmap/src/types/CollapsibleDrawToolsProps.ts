import { Map } from "ol";
import VectorSource from "ol/source/Vector";

export interface CollapsibleDrawToolsProps {
    map: Map;
    vectorSource: VectorSource | null;
  };