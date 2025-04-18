import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Point } from 'ol/geom';
import Feature from 'ol/Feature';
import { Style, Fill, Stroke, Text, Circle } from 'ol/style';
import { Select } from 'ol/interaction';
import { click } from 'ol/events/condition';
import { Spinner } from 'react-bootstrap';
import FloorPlanModal from './FloorPlanModal';
import { Building } from '../utils/types';

const generateSampleWarehouses = (): Building[] => [
  {
    id: 1,
    name: 'Merkez Depo',
    lon: 29.0,
    lat: 41.0,
    address: 'Sanayi Mah. Depo Sokak No:1, İstanbul',
    floors: [
      {
        level: 'Zemin Kat',
        scale: 0.5,
        elements: [
          {
            type: 'outer-wall',
            name: 'Dış Duvar',
            coordinates: [[0, 0], [10, 0], [10, 6], [0, 6], [0, 0]],
            thickness: 5,
            color: '#333'
          },
          {
            type: 'inner-wall',
            name: 'Bölme Duvarı',
            coordinates: [[3, 0], [3, 4]],
            thickness: 3,
            color: '#666'
          },
          {
            type: 'room',
            name: 'Ofis Alanı',
            coordinates: [[0, 0], [3, 0], [3, 2], [0, 2]],
            properties: { area: '30 m²', purpose: 'Yönetim' }
          },
          {
            type: 'raf',
            name: 'Standart Raf',
            coordinates: [[4, 1], [8, 1], [8, 5], [4, 5]],
            properties: { 
              capacity: 1000, 
              type: 'A tipi',
              products: [
                { id: 1, name: 'Ürün A', code: 'PRD-001', quantity: 50, color: '#FF5733' },
                { id: 2, name: 'Ürün B', code: 'PRD-002', quantity: 30, color: '#33FF57' }
              ]
            }
          }
        ]
      }
    ]
  }
];

const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setBuildings(generateSampleWarehouses());
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    if (!mapRef.current || buildings.length === 0) return;

    const map = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({ center: fromLonLat([29.0, 41.0]), zoom: 10 })
    });

    const source = new VectorSource();
    
    buildings.forEach(building => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([building.lon, building.lat])),
        building: building,
        id: building.id
      });

      feature.setStyle(
        new Style({
          image: new Circle({
            radius: 10,
            fill: new Fill({color: '#FF0000'}),
            stroke: new Stroke({color: '#FFFFFF', width: 2})
          }),
          text: new Text({
            text: building.name,
            offsetY: -20,
            font: '12px Arial',
            fill: new Fill({color: '#000000'})
          })
        })
      );

      source.addFeature(feature);
    });

    const vectorLayer = new VectorLayer({ source });
    map.addLayer(vectorLayer);

    const select = new Select({
      condition: click,
      layers: [vectorLayer],
      hitTolerance: 20,
      filter: (feature) => !!feature.get('building')
    });

    select.on('select', (e) => {
      if (e.selected.length > 0) {
        const selectedFeature = e.selected[0];
        setSelectedBuilding(selectedFeature.get('building'));
      } else {
        setSelectedBuilding(null);
      }
    });

    map.addInteraction(select);

    return () => {
      map.setTarget(undefined);
      map.dispose();
    };
  }, [buildings]);

  const handleSaveBuilding = (updatedBuilding: Building) => {
    setBuildings(prev => prev.map(b => b.id === updatedBuilding.id ? updatedBuilding : b));
    setSelectedBuilding(null);
  };

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <Spinner animation="border" variant="primary" />
          <span className="ms-2">Yükleniyor...</span>
        </div>
      )}
      
      <div ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
      
      {selectedBuilding && (
        <FloorPlanModal
          building={selectedBuilding}
          onClose={() => setSelectedBuilding(null)}
          onSave={handleSaveBuilding}
        />
      )}
    </div>
  );
};

export default MapComponent;