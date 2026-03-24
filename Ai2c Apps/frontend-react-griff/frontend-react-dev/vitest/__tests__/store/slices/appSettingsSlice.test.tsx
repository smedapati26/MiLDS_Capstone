import { mockTestUnitDto } from 'vitest/mocks/griffin_api_handlers/units/mock_data';
import { mockAppUser } from 'vitest/mocks/griffin_api_handlers/users/mock_data';

import { configureStore } from '@reduxjs/toolkit';

import { Echelon } from '@ai2c/pmx-mui/models';

import { IUnitBrief, mapToIUnitBrief } from '@store/griffin_api/auto_dsr/models';
import { appSettingsReducer, setAllUnits, setAppUser, setCurrentUnit } from '@store/slices/appSettingsSlice';

describe('appSettingsSlice', () => {
  const initialState = {
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
    currentUic: '',
    currentUnit: {
      component: '',
      displayName: '',
      echelon: 'UNK',
      level: 0,
      shortName: '',
      uic: '',
    },
    allUnits: [],
    currentUnitAdmin: false,
    currentUnitWrite: false,
    currentUnitAmapManager: false,
    currentUnitAmapRecorder: false,
    currentUnitAmapViewer: false,
  };

  const store = configureStore({
    reducer: {
      appSettings: appSettingsReducer,
    },
  });

  it('should handle initial state', () => {
    expect(store.getState().appSettings).toEqual(initialState);
  });

  it('should handle setAppUser', () => {
    store.dispatch(setAppUser(mockAppUser));
    expect(store.getState().appSettings.appUser).toEqual(mockAppUser);
  });

  it('should handle setCurrentUnit', () => {
    const unit: IUnitBrief = mapToIUnitBrief(mockTestUnitDto);
    store.dispatch(setCurrentUnit(unit));
    expect(store.getState().appSettings.currentUnit).toEqual(unit);
    expect(store.getState().appSettings.currentUic).toEqual(unit.uic);
  });

  it('should handle setAllUnits', () => {
    const units: Array<IUnitBrief> = [mapToIUnitBrief(mockTestUnitDto)];
    store.dispatch(setAllUnits(units));
    expect(store.getState().appSettings.allUnits).toEqual(units);
  });
});
