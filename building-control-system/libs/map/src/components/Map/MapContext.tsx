// libs/map/src/components/MapComponent/MapContext.tsx
import React, { createContext, useContext } from 'react';
import { Map } from 'ol';

const MapContext = createContext<Map | null>(null);

export const MapProvider = MapContext.Provider;

export const useMap = () => {
  const map = useContext(MapContext);
  if (!map) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return map;
};