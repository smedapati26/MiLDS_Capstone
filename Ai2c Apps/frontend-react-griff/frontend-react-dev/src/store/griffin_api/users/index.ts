import { adminRoleRequestApi, griffinUsersApi, roleRequestApi, userRoleApi } from './slices';

/* Reducers */
export const griffinUserReducers = {
  [griffinUsersApi.reducerPath]: griffinUsersApi.reducer,
  [adminRoleRequestApi.reducerPath]: adminRoleRequestApi.reducer,
  [roleRequestApi.reducerPath]: roleRequestApi.reducer,
  [userRoleApi.reducerPath]: userRoleApi.reducer,
};

/* Middlewares */
export const griffinUserMiddleware = [
  griffinUsersApi.middleware,
  adminRoleRequestApi.middleware,
  roleRequestApi.middleware,
  userRoleApi.middleware,
];
