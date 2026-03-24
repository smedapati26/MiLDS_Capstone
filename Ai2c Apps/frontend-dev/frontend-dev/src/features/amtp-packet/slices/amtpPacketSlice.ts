import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { EventType } from '@store/amap_ai/events';

export type IMaintainer = {
  id: string;
  name: string;
  primaryMos?: string;
  mos?: string[] | null;
  ml?: string[] | null;
  pv2Dor: string | null;
  pfcDor: string | null;
  sfcDor: string | null;
  sgtDor: string | null;
  spcDor: string | null;
  ssgDor: string | null;
};

export interface IAmtpPacketState {
  eventId: number | null;
  maintainer: IMaintainer | null;
  faultRecord: string | null;
  eventType: EventType | null;
  eventTrainingType: string | null;
  eventTask: { name: string; number: string; result: string } | null;
  updateAvailability: boolean;
}

const initialState: IAmtpPacketState = {
  maintainer: null,
  faultRecord: null,
  eventId: null,
  eventType: null,
  eventTrainingType: null,
  eventTask: null,
  updateAvailability: false,
};

export const amtpPacketSlice = createSlice({
  name: 'amtpPacket',
  initialState,
  reducers: {
    setMaintainer: (state, action: PayloadAction<IMaintainer | null>) => {
      state.maintainer = action.payload;
    },
    setFaultRecord: (state, action: PayloadAction<string | null>) => {
      state.faultRecord = action.payload;
    },
    setEventId: (state, action: PayloadAction<number | null>) => {
      state.eventId = action.payload;
    },
    setEventType: (state, action: PayloadAction<EventType | null>) => {
      state.eventType = action.payload;
    },
    setEventTrainingType: (state, action: PayloadAction<string | null>) => {
      state.eventTrainingType = action.payload;
    },
    setEventTask: (state, action: PayloadAction<{ name: string; number: string; result: string } | null>) => {
      state.eventTask = action.payload;
    },
    setUpdateAvailability: (state, action: PayloadAction<boolean>) => {
      state.updateAvailability = action.payload;
    },
  },
});

// Actions
export const {
  setMaintainer,
  setEventId,
  setEventType,
  setEventTask,
  setFaultRecord,
  setEventTrainingType,
  setUpdateAvailability,
} = amtpPacketSlice.actions;

// Reducer
export const amtpPacketReducer = amtpPacketSlice.reducer;
