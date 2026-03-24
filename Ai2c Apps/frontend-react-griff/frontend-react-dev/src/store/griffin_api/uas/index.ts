import { uacApi } from './slices/uacApi';
import { uavApi } from './slices/uavApi';

/* Reducers */
export const uasReducers = {
  [uacApi.reducerPath]: uacApi.reducer,
  [uavApi.reducerPath]: uavApi.reducer,
};

/* Middlewares */
export const uasMiddleware = [uacApi.middleware, uavApi.middleware];
