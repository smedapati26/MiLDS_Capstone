import { createSlice } from '@reduxjs/toolkit';

import { Echelon } from '@ai2c/pmx-mui/models';

import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';
import { IAppUser } from '@store/griffin_api/users/models/IAppUser';
import { RootState } from '@store/store';

export interface IAppSettingsSliceState {
  appUser: IAppUser;
  currentUic: string;
  currentUnit: IUnitBrief;
  allUnits: Array<IUnitBrief>;
  currentUnitAdmin: boolean;
  currentUnitWrite: boolean;
  currentUnitAmapViewer: boolean;
  currentUnitAmapRecorder: boolean;
  currentUnitAmapManager: boolean;
}

export const initialAppSettingsState: IAppSettingsSliceState = {
  appUser: {
    userId: '',
    rank: '',
    firstName: '',
    lastName: '',
    isAdmin: false,
    newUser: true,
    unit: {
      uic: '',
      shortName: '',
      displayName: '',
      echelon: Echelon.UNKNOWN,
      component: '',
      level: 0,
    },
  },
  allUnits: [],
  currentUic: '',
  currentUnit: {
    uic: '',
    shortName: '',
    displayName: '',
    echelon: Echelon.UNKNOWN,
    component: '',
    level: 0,
  },
  currentUnitAdmin: false,
  currentUnitWrite: false,
  currentUnitAmapViewer: false,
  currentUnitAmapRecorder: false,
  currentUnitAmapManager: false,
};

// Slice
export const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState: initialAppSettingsState,
  reducers: {
    setAppUser: (state, action) => {
      state.appUser = action.payload;
      state.currentUnit = action.payload.unit;
      state.currentUic = action.payload.unit.uic;
      localStorage.setItem('current_uic', action.payload.unit.uic);
    },
    setCurrentUnit: (state, action) => {
      state.currentUnit = action.payload;
      state.currentUic = action.payload.uic;
      localStorage.setItem('current_uic', action.payload.uic);
    },
    setAllUnits: (state, action) => {
      state.allUnits = action.payload;
    },
    setUnitPermissions: (state, action: { payload: { adminUics: string[]; writeUics: string[] } }) => {
      const { adminUics, writeUics } = action.payload;

      if (state.appUser.isAdmin) {
        state.currentUnitAdmin = true;
        state.currentUnitWrite = true;
      } else {
        const currentUic = state.currentUic;
        state.currentUnitAdmin = adminUics.includes(currentUic);
        state.currentUnitWrite = state.currentUnitAdmin || writeUics.includes(currentUic);
      }
    },
    setAmapUnitPermissions: (
      state,
      action: { payload: { viewerUics: string[]; recorderUics: string[]; managerUics: string[] } },
    ) => {
      const { viewerUics, recorderUics, managerUics } = action.payload;
      const currentUic = state.currentUic;
      state.currentUnitAmapManager = managerUics.includes(currentUic);
      state.currentUnitAmapRecorder = state.currentUnitAmapManager || recorderUics.includes(currentUic);
      state.currentUnitAmapViewer =
        state.currentUnitAmapManager || state.currentUnitAmapRecorder || viewerUics.includes(currentUic);
    },
  },
});

// Actions
export const { setAppUser, setCurrentUnit, setAllUnits, setUnitPermissions, setAmapUnitPermissions } =
  appSettingsSlice.actions;

// Selectors
export const selectAppUser = (state: RootState) => state.appSettings.appUser;
export const selectCurrentUnit = (state: RootState) => state.appSettings.currentUnit;
export const selectCurrentUic = (state: RootState) => state.appSettings.currentUic;
export const selectAllUnits = (state: RootState) => state.appSettings.allUnits;
export const selectCurrentUnitAdmin = (state: RootState) => state.appSettings.currentUnitAdmin;
export const selectCurrentUnitWrite = (state: RootState) => state.appSettings.currentUnitWrite;
export const selectCurrentUnitAmapViewer = (state: RootState) => state.appSettings.currentUnitAmapViewer;
export const selectCurrentUnitAmapRecorder = (state: RootState) => state.appSettings.currentUnitAmapRecorder;
export const selectCurrentUnitAmapManager = (state: RootState) => state.appSettings.currentUnitAmapManager;

// Reducer
export const appSettingsReducer = appSettingsSlice.reducer;
