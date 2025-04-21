import { Map } from "ol";
import { useState } from "react";
import CollapsibleDrawTools from "./DrawTools";
import CollapsiblePolygonAnalyzer from "./PolygonAnalyzer";
import VectorSource from "ol/source/Vector";

interface MapToolsProps {
  map: Map;
  vectorSource: VectorSource | null;
}

const MapTools = ({ map, vectorSource }: MapToolsProps) => {
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
      
      {activePanel === 'draw' && <CollapsibleDrawTools map={map} vectorSource={vectorSource} />}
      {activePanel === 'polygon' && <CollapsiblePolygonAnalyzer map={map} vectorSource={vectorSource} />}
    </div>
  );
};

export default MapTools;