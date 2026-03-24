import { amapUsersApi } from './slices/amapUsersApi';

/* Reducers */
export const amapUsersReducers = {
  [amapUsersApi.reducerPath]: amapUsersApi.reducer,
};

/* Middlewares */
export const amapUsersMiddleware = [amapUsersApi.middleware];
