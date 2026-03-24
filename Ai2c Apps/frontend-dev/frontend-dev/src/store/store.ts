import { createLogger } from 'redux-logger';

import { configureStore } from '@reduxjs/toolkit';

import { amtpPacketSlice } from '@features/amtp-packet/slices';
import { recentSearchesSlice } from '@features/uctl-manager/slices/recentSearchesSlice';
import { unitHealthSlice } from '@features/unit-health/slices/unitHealthSlice';
import {
  counselingsApiSlice,
  designationApiSlice,
  eventsApiSlice,
  mosCodeApiSlice,
  readinessApiSlice,
  soldierApiSlice,
  soldierFlagApiSlice,
  soldierManagerApiSlice,
  supportingDocumentApiSlice,
  tasksApiSlice,
  transferRequestsApiSlice,
  unitHealthApiSlice,
  unitsApiSlice,
  userApiSlice,
  userRequestApiSlice,
  userRoleApiSlice,
} from '@store/amap_ai';
import { faultsApiSlice } from '@store/amap_ai/faults/slices/faultsApi';
import { mockApiSlice } from '@store/slices/mock-api.slice';

import { cancellationMiddleware } from './cancellationMiddleware';
import { appSettingsReducer } from './slices';

// Add Redux logger during Development
const isDevelopment = import.meta.env.VITE_USER_NODE_ENV !== 'production';
const logger = createLogger();

const ignoreSerialize = {
  serializableCheck: {
    ignoredActions: ['amtpPacketApi/executeMutation/rejected', 'tasksApi/executeQuery/fulfilled'],
    ignoredPaths: ['amtpPacketApi.mutations', 'tasksApi'],
    ignoredActionPaths: ['meta.signal', 'meta.baseQueryMeta.request', 'meta.baseQueryMeta.response'],
  },
};

const apiMiddlewares = [
  readinessApiSlice.middleware,
  faultsApiSlice.middleware,
  mockApiSlice.middleware,
  eventsApiSlice.middleware,
  soldierManagerApiSlice.middleware,
  transferRequestsApiSlice.middleware,
  supportingDocumentApiSlice.middleware,
  tasksApiSlice.middleware,
  unitsApiSlice.middleware,
  userApiSlice.middleware,
  designationApiSlice.middleware,
  counselingsApiSlice.middleware,
  soldierFlagApiSlice.middleware,
  unitHealthApiSlice.middleware,
  mosCodeApiSlice.middleware,
  userRoleApiSlice.middleware,
  userRequestApiSlice.middleware,
  soldierApiSlice.middleware,
];

const allMiddlewares = Array.from(new Set(apiMiddlewares));

export const store = configureStore({
  reducer: {
    appSettings: appSettingsReducer,
    [userApiSlice.reducerPath]: userApiSlice.reducer,
    [amtpPacketSlice.reducerPath]: amtpPacketSlice.reducer,
    [readinessApiSlice.reducerPath]: readinessApiSlice.reducer,
    [faultsApiSlice.reducerPath]: faultsApiSlice.reducer,
    [eventsApiSlice.reducerPath]: eventsApiSlice.reducer,
    [soldierManagerApiSlice.reducerPath]: soldierManagerApiSlice.reducer,
    [transferRequestsApiSlice.reducerPath]: transferRequestsApiSlice.reducer,
    [supportingDocumentApiSlice.reducerPath]: supportingDocumentApiSlice.reducer,
    [tasksApiSlice.reducerPath]: tasksApiSlice.reducer,
    [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
    [recentSearchesSlice.reducerPath]: recentSearchesSlice.reducer,
    [mockApiSlice.reducerPath]: mockApiSlice.reducer,
    [designationApiSlice.reducerPath]: designationApiSlice.reducer,
    [counselingsApiSlice.reducerPath]: counselingsApiSlice.reducer,
    [soldierFlagApiSlice.reducerPath]: soldierFlagApiSlice.reducer,
    [unitHealthSlice.reducerPath]: unitHealthSlice.reducer,
    [unitHealthApiSlice.reducerPath]: unitHealthApiSlice.reducer,
    [mosCodeApiSlice.reducerPath]: mosCodeApiSlice.reducer,
    [userRoleApiSlice.reducerPath]: userRoleApiSlice.reducer,
    [userRequestApiSlice.reducerPath]: userRequestApiSlice.reducer,
    [soldierApiSlice.reducerPath]: soldierApiSlice.reducer,
  },
  devTools: isDevelopment,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(ignoreSerialize)
      .concat(isDevelopment ? [logger] : [])
      .concat(...allMiddlewares)
      .concat(cancellationMiddleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
