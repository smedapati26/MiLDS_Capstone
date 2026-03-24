import { inspectionsApi } from './slices/';

/* Reducers */
export const inspectionsApiReducers = {
  [inspectionsApi.reducerPath]: inspectionsApi.reducer,
};

/* Middlewares */
export const inspectionsApiMiddleware = [inspectionsApi.middleware];
