import React, { useEffect, useRef, createContext, useContext } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { defaults as defaultControls } from 'ol/control';

const MapContext = createContext<Map | null>(null);

export const MapComponent: React.FC<{
  center?: [number, number];
  zoom?: number;
  children?: React.ReactNode;
}> = ({ center = [0, 0], zoom = 2, children }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({ center, zoom }),
      controls: defaultControls(),
    });

    setMap(mapInstance);

    return () => mapInstance.setTarget(undefined);
  }, [center, zoom]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '400px' }}>
      <MapContext.Provider value={map}>
        {children}
      </MapContext.Provider>
    </div>
  );
};

export const useMap = () => {
  const map = useContext(MapContext);
  if (!map) throw new Error('useMap must be used within MapComponent');
  return map;
};