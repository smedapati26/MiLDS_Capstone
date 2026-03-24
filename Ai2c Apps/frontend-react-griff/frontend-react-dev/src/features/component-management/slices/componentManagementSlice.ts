import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@store/store';

export interface IComponentManagementState {
  selectedComponentId: string | null;
  filterModel: string | null;
}

const initialState: IComponentManagementState = {
  selectedComponentId: null,
  filterModel: null,
};

export const componentManagementSlice = createSlice({
  name: 'componentManagement',
  initialState,
  reducers: {
    setSelectedComponent: (state, action: PayloadAction<string | null>) => {
      state.selectedComponentId = action.payload;
    },
    setFilterModel: (state, action: PayloadAction<string | null>) => {
      state.filterModel = action.payload;
    },
  },
});

// Actions
export const { setSelectedComponent, setFilterModel } = componentManagementSlice.actions;

// Selectors
export const selectSelectedComponentId = (state: RootState) => state.componentManagement.selectedComponentId;
export const selectFilterModel = (state: RootState) => state.componentManagement.filterModel;

// Reducer
export const componentManagementReducer = componentManagementSlice.reducer;
