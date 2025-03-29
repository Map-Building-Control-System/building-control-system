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
    coordinates: number[][];
    name?: string;
    color?: string;
    thickness?: number;
    properties?: {
      productCode?: string;
      barcode?: string;
      quantity?: number;
      price?: number;
      shelfCode?: string;
      section?: string;
      description?: string;
      [key: string]: any;
    };
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
export interface ElementType {
  name: string;
  color: string;
  thickness?: number;
}
