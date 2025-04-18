// libs/map/DrawComponent.tsx
import React, { useEffect, useState } from 'react';
import { Draw } from 'ol/interaction';
import { useMap, useVectorSource } from './MapComponent';
import { useMapDispatch } from './MapContext';

type DrawType = 'Point' | 'LineString' | 'Polygon' | 'Circle';

export const DrawComponent: React.FC<{
  type: DrawType;
  active?: boolean;
}> = ({ type, active = true }) => {
  const map = useMap();
  const source = useVectorSource();
  const dispatch = useMapDispatch();
  const [drawInteraction, setDrawInteraction] = useState<Draw | null>(null);

  useEffect(() => {
    if (!active) return;

    // Her seferinde yeni bir etkileşim oluştur
    const interaction = new Draw({ 
      source, 
      type: type as any 
    });
    
    const handleDrawEnd = (e: any) => {
      const feature = e.feature;
      dispatch({ 
        type: 'ADD_FEATURE', 
        payload: { type, feature } 
      });
    };

    interaction.on('drawend', handleDrawEnd);
    map.addInteraction(interaction);
    setDrawInteraction(interaction);

    return () => {
      interaction.un('drawend', handleDrawEnd);
      map.removeInteraction(interaction);
      setDrawInteraction(null);
    };
  }, [map, source, type, active, dispatch]);

  return null;
};