// libs/map/MapContext.tsx
import React, { createContext, useContext, useState, useReducer } from 'react';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';

// Context için state tipini tanımlama
type MapState = {
  features: {
    polygons: Feature<Geometry>[];
    points: Feature<Geometry>[];
  };
  activeDrawType: 'Point' | 'LineString' | 'Polygon' | 'Circle' | null;
  pointsInPolygon: Feature<Geometry>[];
};

type MapAction = 
  | { type: 'SET_ACTIVE_DRAW_TYPE'; payload: 'Point' | 'LineString' | 'Polygon' | 'Circle' | null }
  | { type: 'ADD_FEATURE'; payload: { type: 'Point' | 'Polygon'; feature: Feature<Geometry> } }
  | { type: 'SET_POINTS_IN_POLYGON'; payload: Feature<Geometry>[] }
  | { type: 'CLEAR_FEATURES'; payload: 'points' | 'polygons' | 'all' }
  | { type: 'EXPORT_DATA'; }; // Yeni action type eklendi ama işlem MapTools içinde yapılacak

// Context API dışında bir de veri formatı tanımlayalım
export interface PointExport {
  id: string;
  coordinates: number[] | undefined;
  type: string;
}

export interface PointsExportData {
  totalPoints: number;
  points: PointExport[];
  exportDate: string;
}
// Başlangıç durumu
const initialState: MapState = {
  features: {
    polygons: [],
    points: [],
  },
  activeDrawType: null,
  pointsInPolygon: [],
};

// Reducer fonksiyonu
function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'SET_ACTIVE_DRAW_TYPE':
      return { ...state, activeDrawType: action.payload };
    case 'ADD_FEATURE':
      if (action.payload.type === 'Point') {
        return {
          ...state,
          features: {
            ...state.features,
            points: [...state.features.points, action.payload.feature]
          }
        };
      } else if (action.payload.type === 'Polygon') {
        return {
          ...state,
          features: {
            ...state.features,
            polygons: [...state.features.polygons, action.payload.feature]
          }
        };
      }
      return state;
    case 'SET_POINTS_IN_POLYGON':
      return { ...state, pointsInPolygon: action.payload };
    case 'CLEAR_FEATURES':
      if (action.payload === 'points') {
        return {
          ...state,
          features: { ...state.features, points: [] },
          pointsInPolygon: []
        };
      } else if (action.payload === 'polygons') {
        return {
          ...state,
          features: { ...state.features, polygons: [] },
          pointsInPolygon: [] // Poligonlar temizlendiğinde içindeki nokta analizi de sıfırlanmalı
        };
      } else {
        return {
          ...state,
          features: { points: [], polygons: [] },
          pointsInPolygon: []
        };
      }
    default:
      return state;
  }
}

// Context oluşturma
const MapStateContext = createContext<MapState | undefined>(undefined);
const MapDispatchContext = createContext<React.Dispatch<MapAction> | undefined>(undefined);

// Provider bileşeni
export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  return (
    <MapStateContext.Provider value={state}>
      <MapDispatchContext.Provider value={dispatch}>
        {children}
      </MapDispatchContext.Provider>
    </MapStateContext.Provider>
  );
};

// Custom hooks
export const useMapState = () => {
  const context = useContext(MapStateContext);
  if (context === undefined) {
    throw new Error('useMapState must be used within a MapProvider');
  }
  return context;
};

export const useMapDispatch = () => {
  const context = useContext(MapDispatchContext);
  if (context === undefined) {
    throw new Error('useMapDispatch must be used within a MapProvider');
  }
  return context;
};