import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IMaintenanceLane } from '@store/griffin_api/events/models';
import { RootState } from '@store/store';

interface MaintenanceLaneState {
  activeLane: IMaintenanceLane | null;
  isEditFormOpen: boolean;
  activeFormType: 'lane' | 'maint' | null;
}

const initialState: MaintenanceLaneState = {
  activeLane: null,
  isEditFormOpen: false,
  activeFormType: null,
};

const maintenanceLaneSlice = createSlice({
  name: 'maintenanceLane',
  initialState,
  reducers: {
    setActiveLane: (state, action: PayloadAction<IMaintenanceLane>) => {
      state.activeLane = action.payload;
    },
    setIsLaneEditFormOpen: (state, action: PayloadAction<boolean>) => {
      state.isEditFormOpen = action.payload;
    },
    setActiveFormType: (state, action: PayloadAction<'lane' | 'maint'>) => {
      state.activeFormType = action.payload;
    },
    resetMaintenanceLaneSlice: () => initialState,
  },
});

export const selectActiveLane = (state: RootState) => state.maintenanceLane.activeLane;
export const selectIsLaneEditFormOpen = (state: RootState) => state.maintenanceLane.isEditFormOpen;
export const selectActiveFormType = (state: RootState) => state.maintenanceLane.activeFormType;

export const { setActiveLane, setIsLaneEditFormOpen, setActiveFormType, resetMaintenanceLaneSlice } =
  maintenanceLaneSlice.actions;
export const maintenanceLaneReducer = maintenanceLaneSlice.reducer;
