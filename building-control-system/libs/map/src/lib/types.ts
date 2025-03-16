export interface BuildingData {
  id: number;
  coordinates: [number, number]; // [longitude, latitude]
  floors: FloorData[];
}

export interface FloorData {
  id: number;
  name: string;
  plan: [number, number][]; // Array of coordinates for floor outline polygon
  items: FloorItem[];
}

export interface FloorItem {
  type: 'wall' | 'corridor' | 'shelf' | 'desk' | 'product' | string;
  coordinates: [number, number] | [number, number][]; // Point or LineString coordinates
}