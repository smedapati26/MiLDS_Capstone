import { faultsOverTimeApi } from './slices';

/* Reducers */
export const faultsReducers = {
  [faultsOverTimeApi.reducerPath]: faultsOverTimeApi.reducer,
};

/* Middlewares */
export const faultsMiddleware = [faultsOverTimeApi.middleware];
