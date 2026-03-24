import { configureStore } from '@reduxjs/toolkit';

import {
  maintenanceEditEventReducer,
  resetEditEvent,
  setActiveEvent,
  setIsMaintenanceEditForm,
} from '@features/maintenance-schedule/slices/maintenanceEditEventSlice';

describe('maintenanceEditEventSlice', () => {
  const store = configureStore({ reducer: { maintenanceEditEvent: maintenanceEditEventReducer } });

  it('testing initial states', () => {
    const state = store.getState().maintenanceEditEvent;

    expect(state.activeEvent).toBe(null);
    expect(state.isMaintenanceEditForm).toBe(false);
  });

  it('testing setting values', () => {
    store.dispatch(setActiveEvent('2'));
    store.dispatch(setIsMaintenanceEditForm(true));

    const state = store.getState().maintenanceEditEvent;

    expect(state.activeEvent).toBe('2');
    expect(state.isMaintenanceEditForm).toBe(true);
  });

  it('testing reset of values', () => {
    store.dispatch(setActiveEvent('2'));
    store.dispatch(setIsMaintenanceEditForm(true));
    store.dispatch(resetEditEvent());
    const state = store.getState().maintenanceEditEvent;

    expect(state.activeEvent).toBe(null);
    expect(state.isMaintenanceEditForm).toBe(false);
  });
});
