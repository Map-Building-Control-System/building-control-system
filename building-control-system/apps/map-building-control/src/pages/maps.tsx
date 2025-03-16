// pages/index.tsx
import React from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(
  () => import('@building-control-system/Map').then((mod) => mod.MapComponent),
  { ssr: false }
);

const Maps = ()=> {
  return (
    <div>
      <h1>Harita Test</h1>
      <MapComponent />
    </div>
  );
}
export default Maps;