import React from 'react';
import dayjs from 'dayjs';
import { Provider } from 'react-redux';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import CalenderEvents, { Props } from '@features/maintenance-schedule/components/Calendar/MaintenanceCalender/CalenderEvents';
import { CalenderEventTypeEnum, ICalenderEvent } from '@features/maintenance-schedule/models/ICalenderEvent';
import { maintenanceScheduleReducer } from '@features/maintenance-schedule/slices';

const mockStore = configureStore({
  reducer: {
    maintenanceSchedule: maintenanceScheduleReducer,
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>
    </Provider>,
  );
};

describe('CalenderEvents', () => {
  const today = dayjs('10-15-2024');
  const events: ICalenderEvent[] = [
    {
      id: '1',
      name: 'Event 1',
      startDate: today,
      endDate: today.add(1, 'day'),
      type: CalenderEventTypeEnum.HOLIDAY,
    },
  ];

  const props: Props = {
    events,
  };

  it('renders calendar events', () => {
    renderWithProviders(<CalenderEvents events={events} />);

    const eventElements = screen.getAllByTestId(/calender-event-/);
    // Today event is auto created in component
    expect(eventElements.length).toBe(2);
  });

  it('highlights today event', () => {
    renderWithProviders(<CalenderEvents {...props} />);

    const todayElement = screen.getByTestId('calender-event-today');
    expect(todayElement).toBeInTheDocument();
  });
});
