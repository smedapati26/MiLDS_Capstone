import { aircraftApi } from './slices';

/* Reducers */
export const aircraftReducers = {
  [aircraftApi.reducerPath]: aircraftApi.reducer,
};

/* Middlewares */
export const aircraftMiddleware = [aircraftApi.middleware];
