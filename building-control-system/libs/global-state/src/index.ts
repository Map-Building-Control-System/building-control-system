// libs/global-state/src/index.ts

// Store ve tip tanımlarını dışa aktar
export { store } from './lib/store';
export type { RootState, AppDispatch } from './lib/store';

// Custom hook'ları dışa aktar
export { useAppDispatch, useAppSelector } from './lib/hooks';

// Action'ları dışa aktar
export { addFeature, clearFeatures } from './lib/features/map/mapSlice';

// Reducer'ı dışa aktar (isteğe bağlı, doğrudan store içine dahil edildiği için genellikle gerekli değil)
export { default as mapReducer } from './lib/features/map/mapSlice';