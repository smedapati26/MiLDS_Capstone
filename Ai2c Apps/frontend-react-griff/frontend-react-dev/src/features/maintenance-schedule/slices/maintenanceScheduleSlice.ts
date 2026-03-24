import dayjs from 'dayjs';

import { createSlice } from '@reduxjs/toolkit';

import { CalendarLaneGroupingEnum } from '@features/maintenance-schedule/models/CalendarLaneGroupingEnum';
import { CalenderViewEnum } from '@features/maintenance-schedule/models/CalenderViewEnum';
import { getDateRangeDates } from '@utils/helpers';

import { RootState } from '@store/store';

export interface IMaintenanceScheduleState {
  today: dayjs.Dayjs;
  calenderView: CalenderViewEnum;
  dateRanges: Array<dayjs.Dayjs>;
  calendarLaneGrouping: CalendarLaneGroupingEnum;
  calendarEventTypes: string;
}

const initialState: IMaintenanceScheduleState = {
  today: dayjs(),
  calenderView: CalenderViewEnum.MONTHLY,
  dateRanges: getDateRangeDates(dayjs().startOf('month'), dayjs().endOf('month')),
  calendarLaneGrouping: CalendarLaneGroupingEnum.LANE_UNIT,
  calendarEventTypes: 'all',
};

// Slice
export const maintenanceScheduleSlice = createSlice({
  name: 'maintenanceSchedule',
  initialState,
  reducers: {
    setCalenderView: (state, action) => {
      state.calenderView = action.payload;
      state.dateRanges = getDateRangeDates(state.today.startOf(action.payload), state.today.endOf(action.payload));
    },
    setDateRanges: {
      prepare(startDate, endDate) {
        return {
          payload: getDateRangeDates(startDate, endDate),
          meta: undefined,
          error: undefined,
        };
      },
      reducer(state, action) {
        state.dateRanges = action.payload;
      },
    },
    setCalendarLaneGrouping(state, action) {
      state.calendarLaneGrouping = action.payload;
    },
    setCalendarEventTypes(state, action) {
      state.calendarEventTypes = action.payload;
    },
  },
});

// Actions
export const { setCalenderView, setDateRanges, setCalendarLaneGrouping, setCalendarEventTypes } =
  maintenanceScheduleSlice.actions;
// Selectors
export const selectToday = (state: RootState) => state.maintenanceSchedule.today;
export const selectCalenderView = (state: RootState) => state.maintenanceSchedule.calenderView;
export const selectDateRanges = (state: RootState) => state.maintenanceSchedule.dateRanges;
export const selectCalendarLaneGrouping = (state: RootState) => state.maintenanceSchedule.calendarLaneGrouping;
export const selectCalendarEventTypes = (state: RootState) => state.maintenanceSchedule.calendarEventTypes;
// Reducer
export const maintenanceScheduleReducer = maintenanceScheduleSlice.reducer;
