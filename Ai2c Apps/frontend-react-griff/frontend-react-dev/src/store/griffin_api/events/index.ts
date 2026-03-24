import { lanesApi, maintenanceApi, maintenanceCountsApi, maintenanceDetailsApi } from './slices';

/* Reducers */
export const eventsApiReducers = {
  [lanesApi.reducerPath]: lanesApi.reducer,
  [maintenanceCountsApi.reducerPath]: maintenanceCountsApi.reducer,
  [maintenanceApi.reducerPath]: maintenanceApi.reducer,
  [maintenanceDetailsApi.reducerPath]: maintenanceDetailsApi.reducer,
};

/* Middlewares */
export const eventsApiMiddleware = [
  lanesApi.middleware,
  maintenanceCountsApi.middleware,
  maintenanceApi.middleware,
  maintenanceDetailsApi.middleware,
];
