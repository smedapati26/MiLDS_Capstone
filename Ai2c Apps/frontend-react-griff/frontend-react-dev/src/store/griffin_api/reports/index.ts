import { reportsApi } from './slices/reportsApi';

/* Reducers */
export const reportsReducers = {
  [reportsApi.reducerPath]: reportsApi.reducer,
};

/* Middlewares */
export const reportsMiddleware = [reportsApi.middleware];
