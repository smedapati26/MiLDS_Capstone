import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import CalenderFilter from '@features/maintenance-schedule/components/Calendar/MaintenanceCalender/CalenderFilter';
import { maintenanceScheduleReducer } from '@features/maintenance-schedule/slices';

import '@testing-library/jest-dom';

/* CalenderFilter Tests */
describe('CalenderFilterTest', () => {
  const renderWithStore = () => {
    const store = configureStore({
      reducer: {
        maintenanceSchedule: maintenanceScheduleReducer,
      },
    });

    return render(
      <Provider store={store}>
        <CalenderFilter />
      </Provider>,
    );
  };

  beforeEach(() => renderWithStore());

  it('renders calender filter component', () => {
    const component = screen.getByTestId('calender-filter');
    expect(component).toBeInTheDocument();

    const button = screen.getByTestId('calender-filter-button');
    expect(button).toBeInTheDocument();
  });

  it('renders calender filter popover opens on button click', async () => {
    const button = screen.getByTestId('calender-filter-button');
    expect(button).toBeInTheDocument();

    await userEvent.click(button);

    const component = screen.getByTestId('calender-filter-popover');
    expect(component).toBeInTheDocument();
  });

  it('renders opens & closes', async () => {
    const button = screen.getByTestId('calender-filter-button');
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    const popover = screen.getByTestId('calender-filter-popover');
    expect(popover).toBeInTheDocument();
  });
});
