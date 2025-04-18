// libs/map/src/hooks/useMap.ts
import { createContext, useContext } from 'react';
import { Map as OlMap } from 'ol';

const MapContext = createContext<OlMap | null>(null);

export const MapProvider = MapContext.Provider;

export const useMap = () => {
  const map = useContext(MapContext);
  if (!map) throw new Error('useMap must be used within a MapProvider');
  return map;
};