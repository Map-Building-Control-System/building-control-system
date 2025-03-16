import React, { useRef, useEffect, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Circle, Fill } from 'ol/style';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { Draw, Modify } from 'ol/interaction';
import { fromLonLat } from 'ol/proj';
import { Modal, Box, Typography, Button } from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

interface MapComponentProps {
  drawMode?: 'Point' | 'LineString' | 'Polygon' | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ drawMode = null }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<number[] | null>(null);

  // Haritayı başlat
  useEffect(() => {
    if (!mapRef.current) return;

    // Vektör kaynağı ve katmanı oluştur
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new Circle({
          radius: 7,
          fill: new Fill({ color: '#ffcc33' }),
        }),
      }),
    });

    // Harita örneği oluştur
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }), // OSM katmanı
        vectorLayer, // Vektör katmanı
      ],
      view: new View({
        center: fromLonLat([35.5, 40.5]), // Merkez koordinatları
        zoom: 8, // Yakınlaştırma seviyesi
      }),
    });

    // Çizim etkileşimi ekle
    let drawInteraction: Draw | null = null;
    if (drawMode) {
      drawInteraction = new Draw({
        source: vectorSource,
        type: drawMode,
      });
      map.addInteraction(drawInteraction);
    }

    // Haritada tıklama olayını dinle
    map.on('click', (evt) => {
      const coords = evt.coordinate;
      const lonLat = fromLonLat(coords);

      // Tıklanan koordinatları state'e kaydet
      setClickedCoords(lonLat);
      setModalIsOpen(true); // Modal'ı aç

      // Yeni bir nokta ekle
      if (drawMode === 'Point') {
        const point = new Point(coords);
        const feature = new Feature({
          geometry: point,
        });
        vectorSource.addFeature(feature);
      }
    });

    // Temizleme işlemi
    return () => {
      if (drawInteraction) {
        map.removeInteraction(drawInteraction);
      }
      map.setTarget(undefined);
    };
  }, [drawMode]);

  // Modal'ı kapat
  const closeModal = () => {
    setModalIsOpen(false);
    setClickedCoords(null);
  };

  return (
    <>
      <div
        ref={mapRef}
        style={{ 
          width: '100%', 
          height: '600px', // Yükseklik belirli olmalı
          border: '1px solid #ccc',
        }}
      ></div>

      {/* Modal Bileşeni */}
      <Modal open={modalIsOpen} onClose={closeModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" gutterBottom>
            Tıklanan Koordinatlar
          </Typography>
          {clickedCoords && (
            <Typography>
              Enlem: {clickedCoords[1].toFixed(4)}, Boylam: {clickedCoords[0].toFixed(4)}
            </Typography>
          )}
          <Button
            onClick={closeModal}
            variant="contained"
            sx={{ mt: 2 }}
          >
            Kapat
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default MapComponent;