import { hoursFlownApi, missionsFlownApi, statusOverTimeApi } from './slices';

/* Reducers */
export const readinessReducers = {
  [hoursFlownApi.reducerPath]: hoursFlownApi.reducer,
  [missionsFlownApi.reducerPath]: missionsFlownApi.reducer,
  [statusOverTimeApi.reducerPath]: statusOverTimeApi.reducer,
};

/* Middlewares */
export const readinessMiddleware = [
  hoursFlownApi.middleware,
  missionsFlownApi.middleware,
  statusOverTimeApi.middleware,
];
