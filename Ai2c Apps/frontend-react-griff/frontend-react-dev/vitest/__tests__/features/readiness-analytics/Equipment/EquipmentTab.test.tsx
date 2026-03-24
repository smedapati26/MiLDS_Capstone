import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { act, render, screen } from '@testing-library/react';

import EquipmentTab from '@features/readiness-analytics/Equipment/EquipmentTab';

import { useGetMaintenanceSchedulerQuery } from '@store/griffin_api/events/slices';
import { useGetFaultsOverTimeQuery } from '@store/griffin_api/faults/slices';
import { useGetStatusOverTimeQuery } from '@store/griffin_api/readiness/slices';
import { store } from '@store/store';

import { mockPalette } from '@vitest/mocks/theme/mockPalette';

vi.mock('@store/griffin_api/readiness/slices', () => ({
  useGetStatusOverTimeQuery: vi.fn(),
}));

vi.mock('@store/griffin_api/faults/slices', () => ({
  useGetFaultsOverTimeQuery: vi.fn(),
}));

vi.mock('@store/griffin_api/events/slices', () => ({
  useGetMaintenanceSchedulerQuery: vi.fn(),
}));

vi.mock('@store/slices/mock-api.slice', () => ({
  useFooBarQuery: vi.fn(),
}));

const theme = createTheme({ palette: { ...mockPalette } });

describe('EquipmentTab', () => {
  beforeEach(() => {
    vi.mock('@store/hooks', () => ({
      useAppSelector: vi.fn(() => {
        return 'WCEZFF';
      }),
    }));

    (useGetStatusOverTimeQuery as jest.Mock).mockReturnValue({
      data: [
        {
          status: 'Operational',
          count: 10,
          reporting_period: '2023-01',
        },
        {
          status: 'Non-Operational',
          count: 5,
          reporting_period: '2023-01',
        },
        {
          status: 'Operational',
          count: 12,
          reporting_period: '2023-02',
        },
        {
          status: 'Non-Operational',
          count: 3,
          reporting_period: '2023-02',
        },
      ],
      isError: null,
      isFetching: false,
      isUninitialized: false,
    });
    (useGetMaintenanceSchedulerQuery as jest.Mock).mockReturnValue({
      data: {
        unscheduled: [
          {
            id: 1,
            description: 'Unscheduled maintenance 1',
            date: '2023-01-15',
          },
          {
            id: 2,
            description: 'Unscheduled maintenance 2',
            date: '2023-02-20',
          },
        ],
      },
      isError: null,
      isFetching: false,
      isUninitialized: false,
    });
    (useGetFaultsOverTimeQuery as jest.Mock).mockReturnValue({
      data: [
        {
          reporting_period: '2023-01',
          deadline: 5,
          diagonal: 3,
          circle_x: 2,
        },
        {
          reporting_period: '2023-02',
          deadline: 6,
          diagonal: 4,
          circle_x: 1,
        },
      ],
      isError: null,
      isFetching: false,
      isUninitialized: false,
    });
  });

  it('renders equipment tab', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <EquipmentTab />
          </ThemeProvider>
        </Provider>,
      );
    });

    expect(screen.getByTestId('status-over-time-grid-item')).toBeInTheDocument();
    // expect(screen.getByTestId('readiness-impact-grid-item')).toBeInTheDocument();
    // expect(screen.getByTestId('fault-over-time-grid-item')).toBeInTheDocument();
  });
});
