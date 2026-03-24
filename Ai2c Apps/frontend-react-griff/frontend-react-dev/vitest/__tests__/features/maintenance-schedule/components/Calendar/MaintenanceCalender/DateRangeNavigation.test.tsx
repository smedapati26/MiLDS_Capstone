import dayjs from 'dayjs';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DateRangeNavigation from '@features/maintenance-schedule/components/Calendar/MaintenanceCalender/DateRangeNavigation';
import { CalenderViewEnum } from '@features/maintenance-schedule/models/CalenderViewEnum';

import '@testing-library/jest-dom';

/* DateRangeNavigation Tests */
describe('DateRangeNavigationTest', () => {
  const mockStore = configureStore([]);
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore({
      maintenanceSchedule: {
        dateRanges: [dayjs('2024-01-08')],
        calenderView: CalenderViewEnum.WEEKLY,
      },
    });

    store.dispatch = vitest.fn();
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <DateRangeNavigation />
      </Provider>,
    );

  it('renders weekly date range title', () => {
    renderComponent();
    const heading = screen.getByRole('heading', { level: 6 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('08JAN24 - 15JAN24');
  });

  it('renders monthly date range title', () => {
    store = mockStore({
      maintenanceSchedule: {
        dateRanges: [dayjs('2024-10-01')],
        calenderView: CalenderViewEnum.MONTHLY,
      },
    });

    renderComponent();
    const heading = screen.getByRole('heading', { level: 6 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('OCT24');
  });

  it('renders annual date range title', () => {
    store = mockStore({
      maintenanceSchedule: {
        dateRanges: [dayjs('2024-01-01')],
        calenderView: CalenderViewEnum.ANNUAL,
      },
    });

    renderComponent();
    const heading = screen.getByRole('heading', { level: 6 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('2024');
  });

  it('navigates to the previous date range', async () => {
    renderComponent();
    const nextButton = screen.getByTestId('ChevronLeftIcon');
    await userEvent.click(nextButton);
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('navigates to the next date range', async () => {
    renderComponent();
    const nextButton = screen.getByTestId('ChevronRightIcon');
    await userEvent.click(nextButton);
    expect(store.dispatch).toHaveBeenCalled();
  });
});
