import { Provider } from 'react-redux';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import MaintenanceCalendarTab from '@features/maintenance-schedule/components/Calendar/CalendarTab';

import { store } from '@store/store';

import '@testing-library/jest-dom';


/* MaintenanceScheduleLayout Tests */
describe('MaintenanceScheduleLayoutTest', () => {
  beforeEach(() => (window.HTMLElement.prototype.scroll = function () {}));
  beforeEach(() =>
    render(
      <ThemedTestingComponent>
        <Provider store={store}>
          <MaintenanceCalendarTab />
        </Provider>
      </ThemedTestingComponent>,
    ),
  );

  it('renders calender section', () => {
    const component = screen.getByTestId('ms-calender-section');
    expect(component).toBeInTheDocument();
  });

  it('renders bank time section', () => {
    const component = screen.getByTestId('ms-bank-time-section');
    expect(component).toBeInTheDocument();
  });

  it('renders phase details section', () => {
    const component = screen.getByTestId('ms-phase-details-section');
    expect(component).toBeInTheDocument();
  });
});
