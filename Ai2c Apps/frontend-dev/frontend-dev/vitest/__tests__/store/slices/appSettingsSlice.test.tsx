import { mockAppUser } from 'vitest/mocks/handlers/app_user/mock_data';
import { mockTestUnit } from 'vitest/mocks/handlers/units/mock_data';

import { configureStore } from '@reduxjs/toolkit';

import { IUnitBrief, mapToIUnitBrief } from '@store/amap_ai/units/models';
import { appSettingsReducer, setAllUnits, setAppUser, setCurrentUnit } from '@store/slices/appSettingsSlice';

describe('appSettingsSlice', () => {
  const initialState = {
    appUser: null,
    currentUic: '',
    currentUnit: {
      component: '',
      displayName: '',
      echelon: 'UNK',
      level: 0,
      shortName: '',
      uic: '',
    },
    allUnits: undefined,
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
    const unit: IUnitBrief = mapToIUnitBrief(mockTestUnit);
    store.dispatch(setCurrentUnit(unit));
    expect(store.getState().appSettings.currentUnit).toEqual(unit);
    expect(store.getState().appSettings.currentUic).toEqual(unit.uic);
  });

  it('should handle setAllUnits', () => {
    const units: Array<IUnitBrief> = [mapToIUnitBrief(mockTestUnit)];
    store.dispatch(setAllUnits(units));
    expect(store.getState().appSettings.allUnits).toEqual(units);
  });
});
