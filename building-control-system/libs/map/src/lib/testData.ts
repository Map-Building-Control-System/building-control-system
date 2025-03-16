import { BuildingData } from './types';

export const testData: BuildingData[] = [
  {
    id: 1,
    coordinates: [35, 40],
    floors: [
      {
        id: 1,
        name: '1. Kat (Depo)',
        plan: [
          [34.99, 40.01],
          [35.01, 40.01],
          [35.01, 39.99],
          [34.99, 39.99],
          [34.99, 40.01] // Close the polygon
        ],
        items: [
          // Depo duvarları
          { type: 'wall', coordinates: [[34.99, 40.01], [35.01, 40.01]] },
          { type: 'wall', coordinates: [[35.01, 40.01], [35.01, 39.99]] },
          { type: 'wall', coordinates: [[35.01, 39.99], [34.99, 39.99]] },
          { type: 'wall', coordinates: [[34.99, 39.99], [34.99, 40.01]] },
          
          // Koridorlar
          { type: 'corridor', coordinates: [[35.00, 40.00], [35.00, 39.995]] },
          { type: 'corridor', coordinates: [[35.00, 39.995], [35.005, 39.995]] },
          
          // Raflar
          { type: 'shelf', coordinates: [[35.002, 40.008], [35.002, 39.992]] },
          { type: 'shelf', coordinates: [[34.995, 40.005], [35.009, 40.005]] },
          { type: 'shelf', coordinates: [[35.006, 40.002], [35.006, 39.998]] },
          
          // Ürünler (Point type needs single coordinate)
          { type: 'product', coordinates: [35.001, 40.001] },
          { type: 'product', coordinates: [35.003, 40.003] },
          { type: 'product', coordinates: [35.007, 39.997] },
        ],
      },
      {
        id: 2,
        name: '2. Kat (Ofis)',
        plan: [
          [34.99, 40.01],
          [35.01, 40.01],
          [35.01, 39.99],
          [34.99, 39.99],
          [34.99, 40.01] // Close the polygon
        ],
        items: [
          // Ofis duvarları
          { type: 'wall', coordinates: [[34.99, 40.01], [35.01, 40.01]] },
          { type: 'wall', coordinates: [[35.01, 40.01], [35.01, 39.99]] },
          { type: 'wall', coordinates: [[35.01, 39.99], [34.99, 39.99]] },
          { type: 'wall', coordinates: [[34.99, 39.99], [34.99, 40.01]] },
          
          // İç duvarlar
          { type: 'wall', coordinates: [[34.995, 40.01], [34.995, 39.99]] },
          { type: 'wall', coordinates: [[34.995, 39.995], [35.01, 39.995]] },
          
          // Masalar
          { type: 'desk', coordinates: [[34.992, 40.005], [34.992, 40.003]] },
          { type: 'desk', coordinates: [[34.992, 39.997], [34.992, 39.995]] },
          { type: 'desk', coordinates: [[35.002, 39.997], [35.005, 39.997]] },
          { type: 'desk', coordinates: [[35.002, 39.993], [35.005, 39.993]] },
          
          // Ürünler
          { type: 'product', coordinates: [34.992, 40.004] },
          { type: 'product', coordinates: [35.003, 39.997] },
          { type: 'product', coordinates: [35.003, 39.993] },
        ],
      }
    ]
  },
  {
    id: 2,
    coordinates: [35.2, 40.1],
    floors: [
      {
        id: 1,
        name: '1. Kat',
        plan: [
          [35.19, 40.11],
          [35.21, 40.11],
          [35.21, 40.09],
          [35.19, 40.09],
          [35.19, 40.11] // Close the polygon
        ],
        items: [
          // Duvarlar
          { type: 'wall', coordinates: [[35.19, 40.11], [35.21, 40.11]] },
          { type: 'wall', coordinates: [[35.21, 40.11], [35.21, 40.09]] },
          { type: 'wall', coordinates: [[35.21, 40.09], [35.19, 40.09]] },
          { type: 'wall', coordinates: [[35.19, 40.09], [35.19, 40.11]] },
          
          // Koridor
          { type: 'corridor', coordinates: [[35.20, 40.10], [35.20, 40.09]] },
          
          // Raflar
          { type: 'shelf', coordinates: [[35.195, 40.10], [35.195, 40.095]] },
          { type: 'shelf', coordinates: [[35.205, 40.10], [35.205, 40.095]] },
          
          // Ürünler
          { type: 'product', coordinates: [35.195, 40.098] },
          { type: 'product', coordinates: [35.205, 40.098] },
        ],
      }
    ]
  }
];