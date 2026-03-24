import { createSlice } from '@reduxjs/toolkit';

import { Echelon } from '@ai2c/pmx-mui';

import { IUnitBrief } from '@store/amap_ai/units/models';
import { IAppUser } from '@store/amap_ai/user/models';
import { RootState } from '@store/store';

export interface IAppSettingsSliceState {
  appUser: IAppUser | null;
  currentUic: string;
  currentUnit: IUnitBrief;
  allUnits?: Array<IUnitBrief>;
}

const initialState: IAppSettingsSliceState = {
  appUser: null,
  currentUic: '',
  currentUnit: {
    uic: '',
    shortName: '',
    displayName: '',
    echelon: Echelon.UNKNOWN,
    component: '',
    level: 0,
  },
};

// Slice
export const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState,
  reducers: {
    setAppUser: (state, action) => {
      state.appUser = action.payload;
    },
    setCurrentUnit: (state, action) => {
      state.currentUnit = action.payload;
      state.currentUic = action.payload.uic;
    },
    setAllUnits: (state, action) => {
      state.allUnits = action.payload;
    },
  },
});

// Actions
export const { setAppUser, setCurrentUnit, setAllUnits } = appSettingsSlice.actions;
// Selectors
export const selectAppUser = (state: RootState) => state.appSettings.appUser;
export const selectCurrentUnit = (state: RootState) => state.appSettings.currentUnit;
export const selectCurrentUic = (state: RootState) => state.appSettings.currentUic;
export const selectAllUnits = (state: RootState) => state.appSettings.allUnits;
// Reducer
export const appSettingsReducer = appSettingsSlice.reducer;
