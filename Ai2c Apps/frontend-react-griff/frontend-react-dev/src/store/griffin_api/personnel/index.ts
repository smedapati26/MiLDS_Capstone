import { personnelApi } from './slices';

/* Reducers */
export const personnelReducers = {
  [personnelApi.reducerPath]: personnelApi.reducer,
};

/* Middlewares */
export const personnelMiddleware = [personnelApi.middleware];
