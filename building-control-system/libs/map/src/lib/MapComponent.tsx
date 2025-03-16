// lib/MapComponent/index.tsx
import React, { useRef, useEffect } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';

const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    setTimeout(() => {
      map.updateSize();
    }, 200);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '600px',
        border: '1px solid #ccc',
      }}
    ></div>
  );
};


export default MapComponent;