import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { useEffect, useRef, useState } from "react";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";
import 'ol/ol.css';
import CollapsibleDrawTools from "./DrawTools";
import CollapsiblePolygonAnalyzer from "./PolygonAnalyzer";

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
  style = { width: '100%', height: '400px' },
  className = '',
  onMapInit,
  showDrawingTools = false,
}: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Vektör katmanı için kaynak oluştur
    const vectorSource = new VectorSource();
    
    // Vektör özellikleri için varsayılan stil
    const vectorStyle = new Style({
      stroke: new Stroke({ color: 'rgba(0, 123, 255, 0.8)', width: 2 }),
      fill: new Fill({ color: 'rgba(0, 123, 255, 0.2)' }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: 'rgba(0, 123, 255, 0.8)' }),
      }),
    });

    // Çizimler için adlandırılmış vektör katmanı oluştur
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: vectorStyle,
      properties: { name: 'draw-layer' }
    });

    // Harita örneği oluştur
    const map = new Map({
      target: mapRef.current,
      layers: [
        // Temel harita katmanı
        new TileLayer({
          source: new OSM(),
        }),
        // Çizim katmanı
        vectorLayer
      ],
      view: new View({
        center,
        zoom,
        projection: 'EPSG:4326'
      }),
    });

    mapInstance.current = map;
    
    // Harita hazır olduğunda bildir
    map.once('postrender', () => {
      setMapReady(true);
      if (onMapInit) onMapInit(map);
    });

    // Bileşen kaldırıldığında temizle
    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, [center, zoom, onMapInit]);

  return (
    <div className={`position-relative ${className}`} style={style}>
      <div 
        ref={mapRef} 
        className="w-100 h-100 position-absolute top-0 start-0"
      />
      
      {mapReady && mapInstance.current && showDrawingTools && (
        <MapTools map={mapInstance.current} />
      )}
    </div>
  );
};

// Yeni bileşen: DrawTools ve PolygonAnalyzer'ı birleştiren araç paneli
const MapTools = ({ map }: { map: Map }) => {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  
  return (
    <div className="position-absolute top-0 start-0 m-3" style={{ zIndex: 1000 }}>
      <div className="d-flex flex-row gap-2 mb-2">
        <button 
          className={`btn btn-sm ${activePanel === 'draw' ? 'btn-primary' : 'btn-light'}`}
          onClick={() => setActivePanel(activePanel === 'draw' ? null : 'draw')}
        >
          <i className="bi bi-pencil me-1"></i> Çizim Araçları
        </button>
        <button 
          className={`btn btn-sm ${activePanel === 'polygon' ? 'btn-primary' : 'btn-light'}`}
          onClick={() => setActivePanel(activePanel === 'polygon' ? null : 'polygon')}
        >
          <i className="bi bi-pentagon me-1"></i> Poligon Analizi
        </button>
      </div>

      {activePanel === 'draw' && <CollapsibleDrawTools map={map} />}
      {activePanel === 'polygon' && <CollapsiblePolygonAnalyzer map={map} />}
    </div>
  );
};

export default MapComponent;