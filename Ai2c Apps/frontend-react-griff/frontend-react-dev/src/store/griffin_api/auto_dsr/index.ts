import { autoDsrApi } from './slices/autoDsrApi';
import { bankTimeForecastApi } from './slices/bankTimeForecastApi';
import { flyingHoursApi } from './slices/flyingHoursApi';
import { transferRequestsApi } from './slices/transferRequestsApi';
import { unitsApi } from './slices/unitsApi';

import { favoriteUnitsApi } from './slices';

/* Reducers */
export const autoDsrReducers = {
  [autoDsrApi.reducerPath]: autoDsrApi.reducer,
  [bankTimeForecastApi.reducerPath]: bankTimeForecastApi.reducer,
  [flyingHoursApi.reducerPath]: flyingHoursApi.reducer,
  [unitsApi.reducerPath]: unitsApi.reducer,
  [favoriteUnitsApi.reducerPath]: favoriteUnitsApi.reducer,
  [transferRequestsApi.reducerPath]: transferRequestsApi.reducer,
};

/* Middlewares */
export const autoDsrMiddleware = [
  autoDsrApi.middleware,
  bankTimeForecastApi.middleware,
  flyingHoursApi.middleware,
  unitsApi.middleware,
  favoriteUnitsApi.middleware,
  transferRequestsApi.middleware,
];
