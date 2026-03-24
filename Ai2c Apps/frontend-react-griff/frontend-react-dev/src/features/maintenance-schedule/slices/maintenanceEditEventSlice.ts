import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@store/store';

export interface IMaintenanceEditEventState {
  activeEvent: string | null;
  isMaintenanceEditForm: boolean;
}

const initialState: IMaintenanceEditEventState = {
  activeEvent: null,
  isMaintenanceEditForm: false,
};

export const maintenanceEditEventSlice = createSlice({
  name: 'maintenanceEditEventSlice',
  initialState,
  reducers: {
    setIsMaintenanceEditForm: (state, action: PayloadAction<boolean>) => {
      state.isMaintenanceEditForm = action.payload;
    },
    setActiveEvent: (state, action: PayloadAction<string>) => {
      state.activeEvent = action.payload;
    },
    resetEditEvent: () => initialState,
  },
});

// actions
export const { setActiveEvent, setIsMaintenanceEditForm, resetEditEvent } = maintenanceEditEventSlice.actions;

// selectors
export const selectActiveEvent = (state: RootState) => state.maintenanceEditEvent.activeEvent;
export const selectIsMaintenanceEditForm = (state: RootState) => state.maintenanceEditEvent.isMaintenanceEditForm;

// reducer
export const maintenanceEditEventReducer = maintenanceEditEventSlice.reducer;
