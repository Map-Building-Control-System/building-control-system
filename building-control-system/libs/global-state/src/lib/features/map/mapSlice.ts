import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DrawingType {
  type: string; // "Point", "LineString", "Polygon", "Circle"
}

interface MapState {
  drawingTypes: DrawingType[]; // Sadece tipleri tutuyoruz
}

const initialState: MapState = {
  drawingTypes: [],
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    addFeature: (state, action: PayloadAction<DrawingType>) => {
      state.drawingTypes.push(action.payload);
    },
    removeLastFeature: (state) => {
      state.drawingTypes.pop();
    },
    clearFeatures: (state) => {
      state.drawingTypes = [];
    }
  },
});

export const { addFeature, removeLastFeature, clearFeatures } = mapSlice.actions;
export default mapSlice.reducer;