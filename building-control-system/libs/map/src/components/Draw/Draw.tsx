import React, { useEffect } from 'react';
import { Draw } from 'ol/interaction';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { useMap } from '../Map/Map';

type DrawType = 'Point' | 'LineString' | 'Polygon' | 'Circle';

export const DrawComponent: React.FC<{
  type: DrawType;
  onDrawEnd?: (feature: any) => void;
  active?: boolean;
}> = ({ type, onDrawEnd, active = true }) => {
  const map = useMap();

  useEffect(() => {
    const source = new VectorSource();
    const vectorLayer = new VectorLayer({ source });
    map.addLayer(vectorLayer);

    const drawInteraction = new Draw({ source, type: type as any });

    if (active) map.addInteraction(drawInteraction);
    if (onDrawEnd) drawInteraction.on('drawend', (e) => onDrawEnd(e.feature));

    return () => {
      map.removeInteraction(drawInteraction);
      map.removeLayer(vectorLayer);
    };
  }, [map, type, onDrawEnd, active]);

  return null;
};