// libs/map/MapComponent.tsx
import React, { useEffect, useRef, createContext, useContext } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { defaults as defaultControls } from 'ol/control';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';

// Map için context
const MapContext = createContext<Map | null>(null);
const VectorSourceContext = createContext<VectorSource | null>(null);
const VectorLayerContext = createContext<VectorLayer<VectorSource> | null>(null);

export const MapComponent: React.FC<{
  center?: [number, number];
  zoom?: number;
  children?: React.ReactNode;
}> = ({ center = [0, 0], zoom = 2, children }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<Map | null>(null);
  const [vectorSource] = React.useState(new VectorSource());
  const [vectorLayer] = React.useState(
    new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        const geometryType = feature.getGeometry()?.getType();
        
        if (geometryType === 'Point') {
          return new Style({
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({ color: 'blue' }),
              stroke: new Stroke({ color: 'white', width: 2 })
            })
          });
        } else if (geometryType === 'Polygon') {
          return new Style({
            fill: new Fill({ color: 'rgba(255, 0, 0, 0.2)' }),
            stroke: new Stroke({ color: 'red', width: 2 })
          });
        }
        
        return undefined;
      }
    })
  );

  useEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer
      ],
      view: new View({ center, zoom }),
      controls: defaultControls(),
    });

    setMap(mapInstance);

    return () => {
      if (mapInstance) {
        // Temizlik işlemleri
        mapInstance.setTarget(undefined);
      }
    };
  }, []);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '500px', border: '1px solid #ccc' }}>
      {map && (
        <MapContext.Provider value={map}>
          <VectorSourceContext.Provider value={vectorSource}>
            <VectorLayerContext.Provider value={vectorLayer}>
              {children}
            </VectorLayerContext.Provider>
          </VectorSourceContext.Provider>
        </MapContext.Provider>
      )}
    </div>
  );
};

export const useMap = () => {
  const map = useContext(MapContext);
  if (!map) throw new Error('useMap must be used within MapComponent');
  return map;
};

export const useVectorSource = () => {
  const source = useContext(VectorSourceContext);
  if (!source) throw new Error('useVectorSource must be used within MapComponent');
  return source;
};

export const useVectorLayer = () => {
  const layer = useContext(VectorLayerContext);
  if (!layer) throw new Error('useVectorLayer must be used within MapComponent');
  return layer;
};