import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FeatureData {
  name: string;
  description: string;
  type: string;
  wkt: string;
}

interface MapState {
  features: FeatureData[];
}

const initialState: MapState = {
  features: [],
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    addFeature: (state, action: PayloadAction<FeatureData>) => {
      state.features.push(action.payload);
    },
    removeLastFeature: (state) => {
      state.features.pop();
    },
    clearFeatures: (state) => {
      state.features = [];
    }
  },
});

export const { addFeature, removeLastFeature, clearFeatures } = mapSlice.actions;
export default mapSlice.reducer;