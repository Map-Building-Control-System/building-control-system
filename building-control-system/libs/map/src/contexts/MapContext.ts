import { createContext, useContext } from 'react';
import { Map as OlMap } from 'ol';

export const MapContext = createContext<OlMap | null>(null);

export const useMap = () => {
  const map = useContext(MapContext);
  if (!map) throw new Error('useMap must be used within a MapProvider');
  return map;
};