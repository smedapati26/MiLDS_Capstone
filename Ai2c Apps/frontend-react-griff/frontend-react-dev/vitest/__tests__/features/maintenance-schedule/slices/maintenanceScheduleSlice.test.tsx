import dayjs from 'dayjs';

import { configureStore } from '@reduxjs/toolkit';

import { CalenderViewEnum } from '@features/maintenance-schedule/models/CalenderViewEnum';
import { maintenanceScheduleReducer, setCalenderView, setDateRanges } from '@features/maintenance-schedule/slices';
import { getDateRangeDates } from '@utils/helpers';

describe('maintenanceScheduleSlice', () => {
  const store = configureStore({ reducer: { maintenanceSchedule: maintenanceScheduleReducer } });

  it('should handle initial state', () => {
    const state = store.getState().maintenanceSchedule;
    expect(state.today.isSame(dayjs(), 'day')).toBe(true);
    expect(state.calenderView).toBe(CalenderViewEnum.MONTHLY);
    expect(state.dateRanges).toEqual(getDateRangeDates(dayjs().startOf('month'), dayjs().endOf('month')));
  });

  it('should handle setCalenderView', () => {
    store.dispatch(setCalenderView(CalenderViewEnum.WEEKLY));
    const state = store.getState().maintenanceSchedule;
    expect(state.calenderView).toBe(CalenderViewEnum.WEEKLY);
    expect(state.dateRanges).toEqual(
      getDateRangeDates(state.today.startOf(CalenderViewEnum.WEEKLY), state.today.endOf(CalenderViewEnum.WEEKLY)),
    );
  });

  it('should handle setDateRanges', () => {
    const startDate = dayjs().startOf('year');
    const endDate = dayjs().endOf('year');
    store.dispatch(setDateRanges(startDate, endDate));
    const state = store.getState().maintenanceSchedule;
    expect(state.dateRanges).toEqual(getDateRangeDates(startDate, endDate));
  });
});
