import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';

import AnalyticsAircraftView from '@features/component-management/components/Analytics/AnalyticsAircraftView';

import { aircraftApi } from '@store/griffin_api/aircraft/slices';
import {
  useGetAircraftRiskPredictionsQuery,
  useGetComponentPartListQuery,
  useGetComponentRiskQuery,
} from '@store/griffin_api/components/slices/componentsApi';
import { maintenanceApi } from '@store/griffin_api/events/slices/maintenanceApi';

import { mockPalette } from '@vitest/mocks/theme/mockPalette';

vi.mock('@store/griffin_api/components/slices/componentsApi', () => ({
  useGetComponentPartListQuery: vi.fn(),
  useGetComponentRiskQuery: vi.fn(),
  useGetAircraftRiskPredictionsQuery: vi.fn(),
}));

vi.mock('@features/maintenance-schedule/slices/maintenanceApi', async () => {
  const createMiddleware = () => {
    return (next: Dispatch<AnyAction>) => (action: AnyAction) => next(action);
  };

  return {
    maintenanceApi: {
      reducerPath: 'maintenanceApi',
      reducer: () => ({}),
      middleware: () => createMiddleware(),
      keepUnusedDataFor: 300,
      endpoints: {},
    },
    useGetUpcomingMaintenanceQuery: vi.fn().mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    }),
  };
});

const mockTheme = createTheme({ palette: mockPalette });

const mockStore = configureStore({
  reducer: {
    appSettings: () => ({
      currentUnit: { uic: 'TEST123', name: 'Test Unit' },
    }),
    [aircraftApi.reducerPath]: aircraftApi.reducer,
    [maintenanceApi.reducerPath]: maintenanceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(aircraftApi.middleware, maintenanceApi.middleware),
});

describe('AnalyticsAircraftView', () => {
  beforeEach(() => {
    (useGetComponentPartListQuery as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      data: [{ part_number: 'PART-001', nomenclature: 'Test Part 1' }],
      isLoading: false,
    }));

    (useGetComponentRiskQuery as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      data: [
        {
          serial_number: 'TEST-001',
          part_number: 'PART-001',
          nomenclature: 'Test Part 1',
          failure_detail: { failure_prob_100: 0.5 },
        },
      ],
      isFetching: false,
      isLoading: false,
    }));

    (useGetAircraftRiskPredictionsQuery as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      data: [
        {
          serial_number: 'TEST-001',
          failure_detail: { failure_prob_100: 0.3 },
        },
      ],
      isFetching: false,
      isLoading: false,
    }));
  });

  const renderComponent = () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <Provider store={mockStore}>
          <AnalyticsAircraftView />
        </Provider>
      </ThemeProvider>,
    );
  };

  it('renders without crashing', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/select an aircraft to see component analytics/i)).toBeInTheDocument();
    });
  });

  it('shows loading state when data is being fetched', () => {
    (useGetComponentRiskQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: true,
      isFetching: true,
    });
    renderComponent();
    expect(screen.getByText('Select an aircraft to see component analytics.')).toBeInTheDocument();
  });

  it('displays component failure predictions when data is loaded', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Component Failure Predictions')).toBeInTheDocument();
    });
  });

  it('displays aircraft risk predictions when data is loaded', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Aircraft Risk Predictions')).toBeInTheDocument();
    });
  });

  it('displays upcoming maintenance section', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Upcoming Maintenance')).toBeInTheDocument();
    });
  });
});
