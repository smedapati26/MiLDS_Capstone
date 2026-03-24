import { configureStore } from '@reduxjs/toolkit';

import { componentManagementReducer } from '@features/component-management/slices';
import { maintenanceLaneReducer, maintenanceScheduleReducer } from '@features/maintenance-schedule/slices';
import { maintenanceEditEventReducer } from '@features/maintenance-schedule/slices/maintenanceEditEventSlice';
import { maintenanceScheduleFormSlice } from '@features/maintenance-schedule/slices/maintenanceScheduleFormSlice';
import phaseTeamReducer from '@features/maintenance-schedule/slices/phaseTeamSlice';

import { amapPersonnelMiddleware, amapPersonnelReducers } from './amap_api/personnel';
import { amapUsersMiddleware, amapUsersReducers } from './amap_api/users';
import { agseMiddleware, agseReducers } from './griffin_api/agse';
import { aircraftMiddleware, aircraftReducers } from './griffin_api/aircraft';
import { autoDsrMiddleware, autoDsrReducers } from './griffin_api/auto_dsr';
import { componentsMiddleware, componentsReducers } from './griffin_api/components';
import { equipmentMiddleware, equipmentReducers } from './griffin_api/equipment';
import { eventsApiMiddleware, eventsApiReducers } from './griffin_api/events';
import { faultsMiddleware, faultsReducers } from './griffin_api/faults';
import { fhpMiddleware, fhpReducers } from './griffin_api/fhp';
import { inspectionsApiMiddleware, inspectionsApiReducers } from './griffin_api/inspections';
import { modsMiddleware, modsReducers } from './griffin_api/mods';
import { personnelMiddleware, personnelReducers } from './griffin_api/personnel';
import { readinessMiddleware, readinessReducers } from './griffin_api/readiness';
import { reportsMiddleware, reportsReducers } from './griffin_api/reports';
import { taskforceMiddleware, taskforceReducers } from './griffin_api/taskforce';
import { uasMiddleware, uasReducers } from './griffin_api/uas';
import { griffinUserMiddleware, griffinUserReducers } from './griffin_api/users';

import { cancellationMiddleware } from './cancellationMiddleware';
import { appSettingsReducer } from './slices';

// Add Redux logger during Development
// import { createLogger } from 'redux-logger';
// const isDevelopment = true;
// const logger = createLogger();

const ignoreSerialize = {
  serializableCheck: {
    ignoredActions: ['maintenanceSchedule/setDateRanges'],
    ignoredPaths: ['maintenanceSchedule', 'mockApi'],
    ignoredActionPaths: ['meta.signal', 'meta.baseQueryMeta.request', 'meta.baseQueryMeta.response'],
  },
};

export const store = configureStore({
  reducer: {
    // State Slices - TODO: Refactor into Context or feature stores
    appSettings: appSettingsReducer,
    componentManagement: componentManagementReducer,
    maintenanceSchedule: maintenanceScheduleReducer,
    maintenanceScheduleForm: maintenanceScheduleFormSlice.reducer,
    maintenanceLane: maintenanceLaneReducer,
    maintenanceEditEvent: maintenanceEditEventReducer,
    phaseTeam: phaseTeamReducer,
    ...agseReducers,
    ...aircraftReducers,
    ...autoDsrReducers,
    ...componentsReducers,
    ...equipmentReducers,
    ...eventsApiReducers,
    ...faultsReducers,
    ...fhpReducers,
    ...griffinUserReducers,
    ...inspectionsApiReducers,
    ...modsReducers,
    ...personnelReducers,
    ...readinessReducers,
    ...reportsReducers,
    ...uasReducers,
    ...taskforceReducers,

    // AMAP APIs
    ...amapPersonnelReducers,
    ...amapUsersReducers,
  },
  // devTools: isDevelopment,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(ignoreSerialize)
      // .concat(isDevelopment ? [logger] : [])
      .concat(...agseMiddleware)
      .concat(...aircraftMiddleware)
      .concat(...autoDsrMiddleware)
      .concat(...componentsMiddleware)
      .concat(...equipmentMiddleware)
      .concat(...eventsApiMiddleware)
      .concat(...faultsMiddleware)
      .concat(...fhpMiddleware)
      .concat(...griffinUserMiddleware)
      .concat(...inspectionsApiMiddleware)
      .concat(...modsMiddleware)
      .concat(...personnelMiddleware)
      .concat(...readinessMiddleware)
      .concat(...reportsMiddleware)
      .concat(...taskforceMiddleware)
      .concat(...uasMiddleware)
      // AMAP APIs
      .concat(...amapPersonnelMiddleware)
      .concat(...amapUsersMiddleware)
      .concat(cancellationMiddleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
