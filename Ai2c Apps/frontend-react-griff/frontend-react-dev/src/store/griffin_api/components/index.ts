import { componentsApi } from './slices/componentsApi';

/* Reducers */
export const componentsReducers = {
  [componentsApi.reducerPath]: componentsApi.reducer,
};

/* Middlewares */
export const componentsMiddleware = [componentsApi.middleware];
