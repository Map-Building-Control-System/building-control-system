import { Feature } from 'ol';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface DrawSate{
    features: Feature[];
    isActive:boolean;
    drawType: 'Point' | 'LineString' | 'Polygon' | 'Circle';
}
 const initialState : DrawSate = {
    features:[],
    isActive:false,
    drawType:'Point'
 }
 const drawSlice = createSlice({
    name:'draw',
    initialState,
    reducers:{
        addFeature:(state,action:PayloadAction<Feature>)=>{
          state.features.push(action.payload);
        },
        setFeatures: (state, action: PayloadAction<Feature[]>) => {
            state.features = action.payload;
          },
          clearFeatures: (state) => {
            state.features = [];
          },
          setDrawType: (state, action: PayloadAction<'Point' | 'LineString' | 'Polygon' | 'Circle'>) => {
            state.drawType = action.payload;
          },
          setIsActive: (state, action: PayloadAction<boolean>) => {
            state.isActive = action.payload;
          }
    }
 });
 export const { addFeature, setFeatures, clearFeatures, setDrawType, setIsActive } = drawSlice.actions;
export default drawSlice.reducer;