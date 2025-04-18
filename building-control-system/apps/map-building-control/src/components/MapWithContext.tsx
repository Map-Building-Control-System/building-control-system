// components/MapWithContext.tsx
import React from 'react';
import { 
  MapProvider, 
  MapComponent, 
  DrawComponent, 
  PolygonAnalyzer,
  MapTools,
  useMapState
} from '@building-control-system/Map';

const MapContent = () => {
  const { activeDrawType } = useMapState();
  
  return (
    <>
      <MapTools />
      <MapComponent center={[29, 41]} zoom={6}>
        {activeDrawType === 'Polygon' && (
          <DrawComponent type="Polygon" active={true} />
        )}
        {activeDrawType === 'Point' && (
          <DrawComponent type="Point" active={true} />
        )}
        <PolygonAnalyzer />
      </MapComponent>
    </>
  );
};

const MapWithContext = () => {
  return (
    <MapProvider>
      <MapContent />
    </MapProvider>
  );
};

export default MapWithContext;