import { taskforceApi } from './slices/taskforceApi';

/* Reducers */
export const taskforceReducers = {
  [taskforceApi.reducerPath]: taskforceApi.reducer,
};

/* Middlewares */
export const taskforceMiddleware = [taskforceApi.middleware];
