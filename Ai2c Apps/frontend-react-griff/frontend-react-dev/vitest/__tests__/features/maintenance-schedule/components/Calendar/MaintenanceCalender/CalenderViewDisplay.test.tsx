import dayjs from 'dayjs';
import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import CalenderViewDisplay from '@features/maintenance-schedule/components/Calendar/MaintenanceCalender/CalenderViewDisplay';
import { CalendarLaneGroupingEnum } from '@features/maintenance-schedule/models/CalendarLaneGroupingEnum';
import { CalenderViewEnum } from '@features/maintenance-schedule/models/CalenderViewEnum';
import { maintenanceScheduleReducer } from '@features/maintenance-schedule/slices';
import { getDateRangeDates } from '@utils/helpers';

import '@testing-library/jest-dom';

/* CalenderViewDisplay Tests */
describe('CalenderViewDisplayTest', () => {
  const today = dayjs('10-15-2024');

  const renderWithStore = (
    calenderView: CalenderViewEnum,
    dateRanges: Array<dayjs.Dayjs>,
    calendarLaneGrouping: CalendarLaneGroupingEnum,
    calendarEventTypes: 'insp' | 'other'
  ) => {
    const store = configureStore({
      reducer: {
        maintenanceSchedule: maintenanceScheduleReducer,
      },
      preloadedState: {
        maintenanceSchedule: {
          today,
          calendarEventTypes,
          calenderView,
          dateRanges,
          calendarLaneGrouping,
        },
      },
    });

    return render(
      <Provider store={store}>
        <CalenderViewDisplay />
      </Provider>,
    );
  };

  it('renders annual calender view component', () => {
    const dateRanges = getDateRangeDates(today.startOf('year'), today.endOf('year'));
    renderWithStore(CalenderViewEnum.ANNUAL, dateRanges, CalendarLaneGroupingEnum.MODEL, 'insp');

    const component = screen.getByTestId('calender-layout-right-scale');
    expect(component).toBeInTheDocument();
    expect(component).toHaveStyle('grid-template-columns: repeat(12, 1fr)');
  });

  it('renders monthly calender view component', () => {
    const dateRanges = getDateRangeDates(today.startOf('month'), today.endOf('month'));
    renderWithStore(CalenderViewEnum.MONTHLY, dateRanges, CalendarLaneGroupingEnum.MODEL, 'insp');

    const component = screen.getByTestId('calender-layout-right-scale');
    expect(component).toBeInTheDocument();
    expect(component).toHaveStyle('grid-template-columns: repeat(31, 1fr)');
  });

  it('renders weekly calender view component', () => {
    const dateRanges = getDateRangeDates(today.subtract(7, 'day'), today.add(7, 'day'));
    renderWithStore(CalenderViewEnum.WEEKLY, dateRanges, CalendarLaneGroupingEnum.MODEL, 'insp');

    const component = screen.getByTestId('calender-layout-right-scale');
    expect(component).toBeInTheDocument();
    expect(component).toHaveStyle('grid-template-columns: repeat(7, 1fr)');
  });

  it('renders weekends styles', () => {
    const dateRanges = getDateRangeDates(today.subtract(7, 'day'), today.add(7, 'day'));
    renderWithStore(CalenderViewEnum.WEEKLY, dateRanges, CalendarLaneGroupingEnum.MODEL, 'insp');

    const component = screen.getByTestId('calender-layout-right-scale');
    const saturday = component.children[6];
    const sunday = component.children[7];

    expect(saturday).toHaveStyle('color: rgba(0, 0, 0, 0.87)');
    expect(sunday).toHaveStyle('color: rgba(0, 0, 0, 0.87)');
  });
});
