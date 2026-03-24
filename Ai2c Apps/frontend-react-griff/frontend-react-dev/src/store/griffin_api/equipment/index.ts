import { equipmentApi } from './slices';

/* Reducers */
export const equipmentReducers = {
  [equipmentApi.reducerPath]: equipmentApi.reducer,
};

/* Middleware */
export const equipmentMiddleware = [equipmentApi.middleware];
