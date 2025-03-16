// SimpleMap.tsx
import React, { useEffect, useRef } from 'react';
import 'ol/ol.css'; // Bu import çok önemli!
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

const SimpleMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Basit bir harita oluştur
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: [0, 0],
        zoom: 2
      })
    });

    console.log("Harita oluşturuldu:", map);
    
    // Harita boyutunu güncelle
    setTimeout(() => {
      map.updateSize();
      console.log("Harita boyutu güncellendi");
    }, 500);

    return () => {
      map.setTarget(undefined);
      console.log("Harita temizlendi");
    };
  }, []);

  return (
    <div>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '500px', 
          border: '2px solid red' // Görünür bir çerçeve
        }} 
      />
      <p>Harita yukarıda görünmelidir</p>
    </div>
  );
};

export default SimpleMap;