import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';

import { amtpPacketSlice } from '@features/amtp-packet/slices';
import { recentSearchesSlice } from '@features/uctl-manager/slices/recentSearchesSlice';
import { unitHealthSlice } from '@features/unit-health/slices/unitHealthSlice';
import {
  counselingsApiSlice,
  designationApiSlice,
  eventsApiSlice,
  mosCodeApiSlice,
  readinessApiSlice,
  soldierFlagApiSlice,
  supportingDocumentApiSlice,
} from '@store/amap_ai';
import { faultsApiSlice } from '@store/amap_ai/faults/slices/faultsApi';
import { soldierApiSlice } from '@store/amap_ai/soldier/slices/soldierApi';
import { soldierManagerApiSlice } from '@store/amap_ai/soldier_manager/slices/soldierManagerApi';
import { tasksApiSlice } from '@store/amap_ai/tasks/slices/tasksApi';
import { transferRequestsApiSlice } from '@store/amap_ai/transfer_request/slices/transferRequestsApi';
import { unitHealthApiSlice } from '@store/amap_ai/unit_health/slices/unitHealthApi';
import { unitsApiSlice } from '@store/amap_ai/units/slices/unitsApiSlice';
import { userApiSlice } from '@store/amap_ai/user/slices/userApi';
import { userRequestApiSlice } from '@store/amap_ai/user_request/slices/userRequestApiSlice';
import { userRoleApiSlice } from '@store/amap_ai/user_role/slices/userRoleApiSlice';
import { appSettingsReducer } from '@store/slices/appSettingsSlice';
import { mockApiSlice } from '@store/slices/mock-api.slice';
import { RootState } from '@store/store';

export const fakeState: RootState = {
  appSettings: appSettingsReducer(undefined, { type: '' }),
  [readinessApiSlice.reducerPath]: readinessApiSlice.reducer(undefined, { type: '' }),
  [amtpPacketSlice.reducerPath]: amtpPacketSlice.reducer(undefined, { type: '' }),
  [faultsApiSlice.reducerPath]: faultsApiSlice.reducer(undefined, { type: '' }),
  [eventsApiSlice.reducerPath]: eventsApiSlice.reducer(undefined, { type: '' }),
  [mockApiSlice.reducerPath]: mockApiSlice.reducer(undefined, { type: '' }),
  [tasksApiSlice.reducerPath]: tasksApiSlice.reducer(undefined, { type: '' }),
  [recentSearchesSlice.reducerPath]: recentSearchesSlice.reducer(undefined, { type: '' }),
  [unitsApiSlice.reducerPath]: unitsApiSlice.reducer(undefined, { type: '' }),
  [userApiSlice.reducerPath]: userApiSlice.reducer(undefined, { type: '' }),
  [supportingDocumentApiSlice.reducerPath]: supportingDocumentApiSlice.reducer(undefined, { type: '' }),
  [designationApiSlice.reducerPath]: designationApiSlice.reducer(undefined, { type: '' }),
  [counselingsApiSlice.reducerPath]: counselingsApiSlice.reducer(undefined, { type: '' }),
  [soldierFlagApiSlice.reducerPath]: soldierFlagApiSlice.reducer(undefined, { type: '' }),
  [unitHealthSlice.reducerPath]: unitHealthSlice.reducer(undefined, { type: '' }),
  [unitHealthApiSlice.reducerPath]: unitHealthApiSlice.reducer(undefined, { type: '' }),
  [soldierManagerApiSlice.reducerPath]: soldierManagerApiSlice.reducer(undefined, { type: '' }),
  [transferRequestsApiSlice.reducerPath]: transferRequestsApiSlice.reducer(undefined, { type: '' }),
  [mosCodeApiSlice.reducerPath]: mosCodeApiSlice.reducer(undefined, { type: '' }),
  [userRoleApiSlice.reducerPath]: userRoleApiSlice.reducer(undefined, { type: '' }),
  [userRequestApiSlice.reducerPath]: userRequestApiSlice.reducer(undefined, { type: '' }),
  [soldierApiSlice.reducerPath]: soldierApiSlice.reducer(undefined, { type: '' }),
};

export const renderWithProviders = (children: React.ReactElement) => {
  const ignoreSerialize = {
    serializableCheck: {
      ignoredActions: ['maintenanceSchedule/setDateRanges'],
      ignoredPaths: ['maintenanceSchedule'],
    },
  };

  const store = configureStore({
    reducer: {
      appSettings: appSettingsReducer,
      [readinessApiSlice.reducerPath]: readinessApiSlice.reducer,
      [amtpPacketSlice.reducerPath]: amtpPacketSlice.reducer,
      [faultsApiSlice.reducerPath]: faultsApiSlice.reducer,
      [eventsApiSlice.reducerPath]: eventsApiSlice.reducer,
      [mockApiSlice.reducerPath]: mockApiSlice.reducer,
      [recentSearchesSlice.reducerPath]: recentSearchesSlice.reducer,
      [tasksApiSlice.reducerPath]: tasksApiSlice.reducer,
      [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
      [userApiSlice.reducerPath]: userApiSlice.reducer,
      [soldierManagerApiSlice.reducerPath]: soldierManagerApiSlice.reducer,
      [supportingDocumentApiSlice.reducerPath]: supportingDocumentApiSlice.reducer,
      [designationApiSlice.reducerPath]: designationApiSlice.reducer,
      [counselingsApiSlice.reducerPath]: counselingsApiSlice.reducer,
      [soldierFlagApiSlice.reducerPath]: soldierFlagApiSlice.reducer,
      [unitHealthSlice.reducerPath]: unitHealthSlice.reducer,
      [unitHealthApiSlice.reducerPath]: unitHealthApiSlice.reducer,
      [transferRequestsApiSlice.reducerPath]: transferRequestsApiSlice.reducer,
      [soldierApiSlice.reducerPath]: soldierApiSlice.reducer,
      [userRequestApiSlice.reducerPath]: userRequestApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware(ignoreSerialize)
        .concat(readinessApiSlice.middleware)
        .concat(eventsApiSlice.middleware)
        .concat(mockApiSlice.middleware)
        .concat(tasksApiSlice.middleware)
        .concat(unitsApiSlice.middleware)
        .concat(userApiSlice.middleware)
        .concat(faultsApiSlice.middleware)
        .concat(supportingDocumentApiSlice.middleware)
        .concat(designationApiSlice.middleware)
        .concat(counselingsApiSlice.middleware)
        .concat(soldierFlagApiSlice.middleware)
        .concat(unitHealthApiSlice.middleware)
        .concat(soldierManagerApiSlice.middleware)
        .concat(transferRequestsApiSlice.middleware)
        .concat(soldierApiSlice.middleware)
        .concat(userRequestApiSlice.middleware),
  });

  return render(<Provider store={store}>{children}</Provider>);
};
