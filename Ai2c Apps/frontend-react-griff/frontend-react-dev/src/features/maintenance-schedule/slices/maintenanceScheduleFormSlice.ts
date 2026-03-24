import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@store/store';

export interface IMaintenanceScheduleFormState {
  poc: string | null; // uic
  aircraftId: string | null; // serial
  inspectionReferenceId: number | null;
  laneId: number | null;
  maintenanceType: string;
  eventStart: string | null;
  eventEnd: string | null;
  notes: string;
}

const initialState: IMaintenanceScheduleFormState = {
  poc: null,
  aircraftId: null,
  inspectionReferenceId: null,
  laneId: null,
  maintenanceType: 'INSP',
  eventStart: null,
  eventEnd: null,
  notes: '',
};

export const maintenanceScheduleFormSlice = createSlice({
  name: 'maintenanceScheduleFormSlice',
  initialState,
  reducers: {
    setUic: (state, action: PayloadAction<string>) => {
      state.poc = action.payload;
    },
    setAircraftSerialId: (state, action: PayloadAction<string>) => {
      state.aircraftId = action.payload;
    },
    setInspectionReferenceId: (state, action: PayloadAction<number | null>) => {
      state.inspectionReferenceId = action.payload;
    },
    setLaneId: (state, action: PayloadAction<number | null>) => {
      state.laneId = action.payload;
    },
    setEventStart: (state, action: PayloadAction<string | null>) => {
      state.eventStart = action.payload;
    },
    setEventEnd: (state, action: PayloadAction<string | null>) => {
      state.eventEnd = action.payload;
    },
    setNotes: (state, action: PayloadAction<string>) => {
      state.notes = action.payload;
    },
    setMaintenanceType: (state, action: PayloadAction<'insp' | 'other'>) => {
      state.maintenanceType = action.payload;
    },
    resetMaintenanceScheduleForm: () => initialState,
  },
});

// actions
export const {
  resetMaintenanceScheduleForm,
  setEventEnd,
  setEventStart,
  setInspectionReferenceId,
  setLaneId,
  setMaintenanceType,
  setNotes,
  setAircraftSerialId,
  setUic,
} = maintenanceScheduleFormSlice.actions;

// selectors
export const selectUic = (state: RootState) => state.maintenanceScheduleForm.poc;
export const selectAircraftSerialId = (state: RootState) => state.maintenanceScheduleForm.aircraftId;
export const selectInspectionReferenceId = (state: RootState) => state.maintenanceScheduleForm.inspectionReferenceId;
export const selectLaneId = (state: RootState) => state.maintenanceScheduleForm.laneId;
export const selectMaintenanceType = (state: RootState) => state.maintenanceScheduleForm.maintenanceType;
export const selectEventStart = (state: RootState) => state.maintenanceScheduleForm.eventStart;
export const selectEventEnd = (state: RootState) => state.maintenanceScheduleForm.eventEnd;
export const selectNotes = (state: RootState) => state.maintenanceScheduleForm.notes;
// reducer
export const maintenanceScheduleFormReducer = maintenanceScheduleFormSlice.reducer;
