export type BuildingElementType = 
  | 'outer-wall' 
  | 'inner-wall' 
  | 'door' 
  | 'window' 
  | 'room' 
  | 'furniture' 
  | 'raf' 
  | 'product';

export interface BuildingElement {
  type: BuildingElementType;
  name?: string;
  coordinates: number[][];
  thickness?: number;
  color?: string;
  properties?: Record<string, string>;
}

export interface FloorPlan {
  level: string;
  scale: number;
  elements: BuildingElement[];
}

export interface Building {
  id: number;
  name: string;
  lon: number;
  lat: number;
  address: string;
  floors: FloorPlan[];
}

export interface FloorPlanModalProps {
  building: Building;
  onClose: () => void;
  onSave: (building: Building) => void;
}