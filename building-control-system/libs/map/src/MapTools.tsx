// libs/map/MapTools.tsx
import React from 'react';
import { useMapState, useMapDispatch } from './MapContext';

export const MapTools: React.FC = () => {
  const { activeDrawType, pointsInPolygon } = useMapState();
  const dispatch = useMapDispatch();

  const handleSetActiveDrawType = (type: 'Point' | 'Polygon' | null) => {
    dispatch({ type: 'SET_ACTIVE_DRAW_TYPE', payload: type });
  };

  const handleClearFeatures = (type: 'points' | 'polygons' | 'all') => {
    dispatch({ type: 'CLEAR_FEATURES', payload: type });
  };

  const handleExportData = () => {
    // Poligon içindeki noktaların koordinatlarını alıyoruz
    const pointsData = pointsInPolygon.map(point => {
      const coordinates = point.getGeometry()?.getCoordinates();
      return {
        id: point.getId() || `point-${Math.random().toString(36).substr(2, 9)}`,
        coordinates: coordinates,
        type: 'Point'
      };
    });

    // JSON verisini oluşturuyoruz
    const dataToExport = {
      totalPoints: pointsInPolygon.length,
      points: pointsData,
      exportDate: new Date().toISOString()
    };

    // Veriyi JSON string'e dönüştürüyoruz
    const dataStr = JSON.stringify(dataToExport, null, 2);
    
    // Veriyi indirmek için bir blob oluşturuyoruz
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // İndirme bağlantısı oluşturuyoruz
    const a = document.createElement('a');
    a.download = `map-points-${new Date().toISOString().slice(0,10)}.json`;
    a.href = url;
    a.click();
    
    // URL'yi temizliyoruz
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={() => handleSetActiveDrawType('Point')}
          style={{ 
            backgroundColor: activeDrawType === 'Point' ? '#4CAF50' : '#f1f1f1',
            margin: '0 5px 5px 0',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Nokta Çiz
        </button>
        <button 
          onClick={() => handleSetActiveDrawType('Polygon')}
          style={{ 
            backgroundColor: activeDrawType === 'Polygon' ? '#4CAF50' : '#f1f1f1',
            margin: '0 5px 5px 0',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Poligon Çiz
        </button>
        <button 
          onClick={() => handleSetActiveDrawType(null)}
          style={{ 
            backgroundColor: activeDrawType === null ? '#4CAF50' : '#f1f1f1',
            margin: '0 5px 5px 0',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Çizimi Durdur
        </button>
      </div>
      
      <div>
        <button 
          onClick={() => handleClearFeatures('points')}
          style={{ 
            backgroundColor: '#f44336',
            margin: '0 5px 5px 0',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'white'
          }}
        >
          Noktaları Temizle
        </button>
        <button 
          onClick={() => handleClearFeatures('polygons')}
          style={{ 
            backgroundColor: '#f44336',
            margin: '0 5px 5px 0',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'white'
          }}
        >
          Poligonları Temizle
        </button>
        <button 
          onClick={() => handleClearFeatures('all')}
          style={{ 
            backgroundColor: '#f44336',
            margin: '0 5px 5px 0',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'white'
          }}
        >
          Tümünü Temizle
        </button>
      </div>
      
      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: '15px' }}>
          <strong>Analiz Sonucu:</strong> {pointsInPolygon.length} nokta poligon içinde
        </div>
        
        <button
          onClick={handleExportData}
          disabled={pointsInPolygon.length === 0}
          style={{
            backgroundColor: pointsInPolygon.length > 0 ? '#2196F3' : '#cccccc',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: pointsInPolygon.length > 0 ? 'pointer' : 'not-allowed',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          Verileri İndir
        </button>
      </div>
    </div>
  );
};