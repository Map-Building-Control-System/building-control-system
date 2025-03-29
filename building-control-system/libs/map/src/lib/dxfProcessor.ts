import DxfParser from 'dxf-parser';
import {BuildingElement ,FloorPlan} from '../utils/types';

export const processDxfFile = (file: File): Promise<FloorPlan> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parser = new DxfParser();
        const dxf = parser.parse(e.target?.result as string);
        if (!dxf || !dxf.entities) {
            throw new Error('DXF dosyası geçersiz veya boş');
          }
        const elements: BuildingElement[] = [];
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        // Önce sadece koordinat sınırlarını belirle
        dxf.entities.forEach((entity: any) => {
          // Sadece LINE, LWPOLYLINE ve POLYLINE varlıklarını işle
          if (['LINE', 'LWPOLYLINE', 'POLYLINE'].includes(entity.type)) {
            const processCoords = (coords: any) => {
              if (Array.isArray(coords)) {
                coords.forEach(coord => {
                  const x = coord.x ?? coord[0] ?? 0;
                  const y = coord.y ?? coord[1] ?? 0;
                  if (!isNaN(x) && !isNaN(y)) {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                  }
                });
              }
            };

            if (entity.type === 'LINE') {
              processCoords([
                { x: entity.startPoint?.x ?? entity.x1 ?? 0, y: entity.startPoint?.y ?? entity.y1 ?? 0 },
                { x: entity.endPoint?.x ?? entity.x2 ?? 0, y: entity.endPoint?.y ?? entity.y2 ?? 0 }
              ]);
            } else if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
              processCoords(entity.vertices || entity.points || []);
            }
          }
        });

        // Eğer geçerli koordinat bulunamazsa varsayılan değerler
        if (!isFinite(minX)) minX = 0;
        if (!isFinite(minY)) minY = 0;
        if (!isFinite(maxX)) maxX = 10;
        if (!isFinite(maxY)) maxY = 10;

        // Boyut ve merkez hesaplama
        const width = maxX - minX;
        const height = maxY - minY;
        const centerX = minX + width / 2;
        const centerY = minY + height / 2;

        // Ölçeklendirme faktörünü en boy oranını koruyarak hesapla
        const scaleX = 10 / (width || 1);
        const scaleY = 10 / (height || 1);
        const scale = Math.min(scaleX, scaleY);

        // Şimdi elemanları oluştur
        dxf.entities.forEach((entity: any) => {
          try {
            // Sadece işlemek istediğimiz varlık türlerini ele al
            if (!['LINE', 'LWPOLYLINE', 'POLYLINE'].includes(entity.type)) return;

            // Koordinatları normalize et ve merkeze hizala
            const normalizeCoord = (coord: any) => {
              const x = coord.x ?? coord[0] ?? 0;
              const y = coord.y ?? coord[1] ?? 0;
              
              if (isNaN(x) || isNaN(y)) return null;
              
              // Merkeze hizalanmış koordinatlar
              return [
                ((x - centerX) * scale) + 5, // 5 = harita genişliği/2
                ((y - centerY) * scale) + 5  // 5 = harita yüksekliği/2
              ];
            };

            if (entity.type === 'LINE') {
              const start = normalizeCoord({ 
                x: entity.startPoint?.x ?? entity.x1 ?? 0, 
                y: entity.startPoint?.y ?? entity.y1 ?? 0 
              });
              const end = normalizeCoord({ 
                x: entity.endPoint?.x ?? entity.x2 ?? 0, 
                y: entity.endPoint?.y ?? entity.y2 ?? 0 
              });

              // Geçersiz koordinat kontrolü
              if (!start || !end) return;
              
              // Çok kısa çizgileri elemek için mesafe kontrolü
              const dx = end[0] - start[0];
              const dy = end[1] - start[1];
              const distance = Math.sqrt(dx*dx + dy*dy);
              
              if (distance < 0.01) return; // Çok kısa çizgileri atla
              
              elements.push({
                type: 'outer-wall',
                coordinates: [start, end],
                thickness: 5,
                color: '#333'
              });
            }
            else if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
              const vertices = (entity.vertices || entity.points || [])
                .map((v: any) => normalizeCoord({ x: v.x ?? v[0] ?? 0, y: v.y ?? v[1] ?? 0 }))
                .filter((coord: number[] | null) => coord !== null); // null koordinatları filtrele

              if (vertices.length > 1) { // 1'den büyük yaparak tek noktaları elemine et
                // Kapalı bir poligon mu?
                const isClosed = vertices.length > 2 && 
                  (entity.closed === true || // Doğrudan kapalı bayrağını kontrol et
                  (Math.abs(vertices[0][0] - vertices[vertices.length-1][0]) < 0.1 &&
                   Math.abs(vertices[0][1] - vertices[vertices.length-1][1]) < 0.1));

                // Poligon alanı hesaplama (kapalı poligonlar için)
                let area = 0;
                if (isClosed && vertices.length > 2) {
                  for (let i = 0; i < vertices.length - 1; i++) {
                    area += vertices[i][0] * vertices[i+1][1] - vertices[i+1][0] * vertices[i][1];
                  }
                  area = Math.abs(area) / 2;
                }

                // Çok küçük poligonları filtrele
                if (isClosed && area < 0.01) return;

                elements.push({
                  type: isClosed ? 'room' : 'inner-wall',
                  coordinates: isClosed && vertices[0] !== vertices[vertices.length-1] 
                    ? [...vertices, vertices[0]] 
                    : vertices,
                  name: isClosed ? `Oda ${elements.filter(e => e.type === 'room').length + 1}` : undefined,
                  color: isClosed ? 'rgba(200, 200, 200, 0.2)' : '#666',
                  thickness: isClosed ? undefined : 3
                });
              }
            }
          } catch (error) {
            console.warn(`Error processing entity ${entity.type}:`, error);
          }
        });

        // Eğer hiç geçerli eleman yoksa hata fırlat
        if (elements.length === 0) {
          throw new Error('DXF dosyası geçerli eleman içermiyor');
        }
        
        // Sonuçları döndür
        resolve({ 
          level: `(${file.name.split('.')[0]})`,
          scale, 
          elements 
        });
      } catch (error) {
        reject(new Error('DXF ayrıştırma hatası: ' + (error instanceof Error ? error.message : String(error))));
      }
    };
    reader.onerror = () => reject(new Error('Dosya okuma başarısız'));
    reader.readAsText(file);
  });
};