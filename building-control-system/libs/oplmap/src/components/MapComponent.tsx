// MapComponent.tsx
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { useEffect, useRef, useState } from "react";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";
import 'ol/ol.css';
import MapTools from "./MapTools";
import { useAppDispatch, useAppSelector } from "@building-control-system/global-state";

interface MapComponentProps {
  center?: number[];
  zoom?: number;
  style?: React.CSSProperties;
  className?: string;
  onMapInit?: (map: Map) => void;
  showDrawingTools?: boolean;
}

const MapComponent = ({
  center = [34, 39],
  zoom = 6,
  style = { width: '100%', height: '100%' },
  className = '',
  onMapInit,
  showDrawingTools = false,
}: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource>(new VectorSource());
  const [mapReady, setMapReady] = useState(false);

  const drawnFeatures = useAppSelector((state) => state.map.features); // global state'deki çizimler

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      style: new Style({
        stroke: new Stroke({ color: 'rgba(0, 123, 255, 0.8)', width: 2 }),
        fill: new Fill({ color: 'rgba(0, 123, 255, 0.2)' }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: 'rgba(0, 123, 255, 0.8)' }),
        }),
      }),
      properties: { name: 'draw-layer' }
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer,
      ],
      view: new View({
        center,
        zoom,
        projection: 'EPSG:4326',
      }),
    });

    mapInstance.current = map;

    map.once('postrender', () => {
      setMapReady(true);
      if (onMapInit) onMapInit(map);
    });

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  useEffect(() => {
    vectorSourceRef.current.clear();
    if (Array.isArray(drawnFeatures)) {
      drawnFeatures.forEach((feature) => {
        vectorSourceRef.current.addFeature(feature);
      });
    }
  }, [drawnFeatures]);

  return (
    <div className={`position-relative ${className}`} style={style}>
      <div
        ref={mapRef}
        className="w-100 h-100 position-absolute top-0 start-0"
      />
      {mapReady && mapInstance.current && showDrawingTools && (
        <MapTools
          map={mapInstance.current}
          vectorSource={vectorSourceRef.current}
        />
      )}
    </div>
  );
};

export default MapComponent;
