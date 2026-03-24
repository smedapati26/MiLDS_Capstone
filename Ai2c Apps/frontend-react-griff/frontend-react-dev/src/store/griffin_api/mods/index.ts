import { modsApi } from './slices';

/* Reducers */
export const modsReducers = {
  [modsApi.reducerPath]: modsApi.reducer,
};

/* Middleware */
export const modsMiddleware = [modsApi.middleware];
