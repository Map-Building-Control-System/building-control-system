import TileLayer from "ol/layer/Tile";
import Map from "ol/Map";
import { fromLonLat } from "ol/proj";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import View from "ol/View";
import { useEffect, useRef } from "react";

const MapComponent: React.FC = ()=>{
    const mapRef = useRef<HTMLDivElement>(null);
    useEffect(()=>{
        const map = new Map({
            target:mapRef.current,
            layers:[new TileLayer({source:new OSM()})],
            view:new View({center:fromLonLat([29.0,41.0]),zoom:10})
        });
        const source = new VectorSource();
        const vectorLayer = new 
        return ;
    },[]);
    return (
        <div style={{height:'100vh',width:'100%',position:'relative'}}>
       
       <div ref={mapRef} style={{height:'100%',width:'100%'}}></div>
        </div>
    );
}
export default MapComponent;