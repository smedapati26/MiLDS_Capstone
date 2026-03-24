import { inexperiencedPersonnelApi, personnelByUnitApi, phaseTeamApi, unavailablePersonnelApi } from './slices';

/* Reducers */
export const amapPersonnelReducers = {
  [inexperiencedPersonnelApi.reducerPath]: inexperiencedPersonnelApi.reducer,
  [personnelByUnitApi.reducerPath]: personnelByUnitApi.reducer,
  [phaseTeamApi.reducerPath]: phaseTeamApi.reducer,
  [unavailablePersonnelApi.reducerPath]: unavailablePersonnelApi.reducer,
};

/* Middlewares */
export const amapPersonnelMiddleware = [
  inexperiencedPersonnelApi.middleware,
  personnelByUnitApi.middleware,
  phaseTeamApi.middleware,
  unavailablePersonnelApi.middleware,
];
