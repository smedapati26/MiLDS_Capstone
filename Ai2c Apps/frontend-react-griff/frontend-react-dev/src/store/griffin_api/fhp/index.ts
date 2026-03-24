import { fhpApi } from './slices';

/* Reducers */
export const fhpReducers = {
  [fhpApi.reducerPath]: fhpApi.reducer,
};

/* Middleware */
export const fhpMiddleware = [fhpApi.middleware];
