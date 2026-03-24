import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { maintenanceLaneReducer, maintenanceScheduleFormSlice } from '@features/maintenance-schedule/slices';
import { maintenanceEditEventSlice } from '@features/maintenance-schedule/slices/maintenanceEditEventSlice';
import phaseTeamReducer from '@features/maintenance-schedule/slices/phaseTeamSlice';

import { phaseTeamApi } from '@store/amap_api/personnel/slices';
import { aircraftApi } from '@store/griffin_api/aircraft/slices';
import { lanesApi, maintenanceApi } from '@store/griffin_api/events/slices';
import { inspectionsApi } from '@store/griffin_api/inspections/slices';

import { mockTestUic } from '../aircraft/mock_data';

const combinedSettingReducer = (state = { currentUic: mockTestUic }) => state;

const rootReducer = combineReducers({
  // Slices
  maintenanceLane: maintenanceLaneReducer,
  maintenanceScheduleForm: maintenanceScheduleFormSlice.reducer,
  maintenanceEditEvent: maintenanceEditEventSlice.reducer,
  phaseTeam: phaseTeamReducer,
  // Apis
  aircraftApi: aircraftApi.reducer,
  appSettings: combinedSettingReducer,
  inspectionApi: inspectionsApi.reducer,
  lanesApi: lanesApi.reducer,
  maintenanceApi: maintenanceApi.reducer,
  maintainerApi: phaseTeamApi,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      aircraftApi.middleware,
      inspectionsApi.middleware,
      lanesApi.middleware,
      maintenanceApi.middleware,
      phaseTeamApi.middleware,
    ),
  preloadedState: {
    appSettings: { currentUic: mockTestUic },
    maintenanceScheduleForm: {
      poc: null,
      aircraftId: null,
      inspectionReferenceId: null,
      laneId: null,
      maintenanceType: 'INSP',
      eventStart: null,
      eventEnd: null,
      notes: '',
    },
    maintenanceEditEvent: {
      activeEvent: null,
      isMaintenanceEditForm: false,
    },
  },
});
