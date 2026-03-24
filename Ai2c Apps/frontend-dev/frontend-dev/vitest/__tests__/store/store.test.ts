import { configureStore } from '@reduxjs/toolkit';

import {
  counselingsApiSlice,
  eventsApiSlice,
  readinessApiSlice,
  soldierFlagApiSlice,
  soldierManagerApiSlice,
  supportingDocumentApiSlice,
} from '@store/amap_ai';
import { faultsApiSlice } from '@store/amap_ai/faults/slices/faultsApi';
import { tasksApiSlice } from '@store/amap_ai/tasks/slices/tasksApi';
import { unitsApiSlice } from '@store/amap_ai/units/slices/unitsApiSlice';
import { userApiSlice } from '@store/amap_ai/user/slices/userApi';
import { appSettingsReducer } from '@store/slices';
import { mockApiSlice } from '@store/slices/mock-api.slice';
import { store } from '@store/store';

describe('Redux Store', () => {
  it('should configure the store correctly', () => {
    const ignoreSerialize = {
      serializableCheck: {
        ignoredActions: ['maintenanceSchedule/setDateRanges'],
        ignoredPaths: ['maintenanceSchedule', 'mockApi'],
      },
    };

    const testStore = configureStore({
      reducer: {
        appSettings: appSettingsReducer,
        [readinessApiSlice.reducerPath]: readinessApiSlice.reducer,
        [eventsApiSlice.reducerPath]: eventsApiSlice.reducer,
        [faultsApiSlice.reducerPath]: faultsApiSlice.reducer,
        [mockApiSlice.reducerPath]: mockApiSlice.reducer,
        [tasksApiSlice.reducerPath]: tasksApiSlice.reducer,
        [userApiSlice.reducerPath]: userApiSlice.reducer,
        [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
        [counselingsApiSlice.reducerPath]: counselingsApiSlice.reducer,
        [soldierManagerApiSlice.reducerPath]: soldierManagerApiSlice.reducer,
        [soldierFlagApiSlice.reducerPath]: soldierFlagApiSlice.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware(ignoreSerialize)
          .concat([])
          .concat(mockApiSlice.middleware)
          .concat(faultsApiSlice.middleware)
          .concat(eventsApiSlice.middleware)
          .concat(unitsApiSlice.middleware)
          .concat(userApiSlice.middleware)
          .concat(readinessApiSlice.middleware)
          .concat(counselingsApiSlice.middleware)
          .concat(soldierManagerApiSlice.middleware)
          .concat(soldierFlagApiSlice.middleware)
          .concat(tasksApiSlice.middleware),
    });

    expect(testStore.getState()).toBeTruthy();
  });

  it('should include the aircraftApiSlice reducer', () => {
    const state = store.getState();
    expect(state).toHaveProperty(unitsApiSlice.reducerPath);
  });

  it('should include the amtpPackApiSlice reducer', () => {
    const state = store.getState();
    expect(state).toHaveProperty(readinessApiSlice.reducerPath);
  });

  it('should include the amtpPackApiSlice reducer', () => {
    const state = store.getState();
    expect(state).toHaveProperty(readinessApiSlice.reducerPath);
  });

  it('should include the mockApiSlice reducer', () => {
    const state = store.getState();
    expect(state).toHaveProperty(mockApiSlice.reducerPath);
  });

  it('should include the eventsApiSlice reducer', () => {
    const state = store.getState();
    expect(state).toHaveProperty(eventsApiSlice.reducerPath);
  });

  it('should include the soldierManagerApiSlice reducer', () => {
    const state = store.getState();
    expect(state).toHaveProperty(soldierManagerApiSlice.reducerPath);
  });

  it('should include the soldierFlagApiSLice reducer', () => {
    const state = store.getState();
    expect(state).toHaveProperty(soldierFlagApiSlice.reducerPath);
  });

  it('should include the counselingsApiSlice reducer', () => {
    const state = store.getState();
    expect(state).toHaveProperty(counselingsApiSlice.reducerPath);
  });

  it('should include the supportingDocumentApiSlice reducer', () => {
    const state = store.getState();
    expect(state).toHaveProperty(supportingDocumentApiSlice.reducerPath);
  });

  it('should include the tasksApiSlice reducer', () => {
    const state = store.getState();
    expect(state).toHaveProperty(tasksApiSlice.reducerPath);
  });

  it('should include the faultsApiSlice reducer', () => {
    const state = store.getState();
    expect(state).toHaveProperty(faultsApiSlice.reducerPath);
  });
});
