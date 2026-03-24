import { agseApi } from './slices';

/* Reducers */
export const agseReducers = {
  [agseApi.reducerPath]: agseApi.reducer,
};

/* Middlewares */
export const agseMiddleware = [agseApi.middleware];
