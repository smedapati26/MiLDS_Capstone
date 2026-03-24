import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import TrainingTab from '@features/readiness-analytics/Training/TrainingTab';

import {
  useGetHoursFlownUnitsQuery,
  useGetMissionsFlownQuery,
  useGetMissionsFlownSummaryQuery,
} from '@store/griffin_api/readiness/slices';
import { useAppSelector } from '@store/hooks';

import { ThemedTestingComponent } from '@vitest/helpers/ThemedTestingComponent';

vi.mock('@store/hooks');
vi.mock('@store/griffin_api/readiness/slices', () => ({
  useGetHoursFlownUnitsQuery: vi.fn(),
  useGetMissionsFlownQuery: vi.fn(),
  useGetMissionsFlownSummaryQuery: vi.fn(),
}));

vi.mock('@components/inputs/PmxDateRangeTabHeader', () => ({
  default: ({
    onDateChange,
  }: {
    onDateChange: (dateRange: { startDate: string; endDate: string; valid: boolean }) => void;
  }) => (
    <div data-testid="tab-header">
      <button onClick={() => onDateChange({ startDate: '2023-01-01', endDate: '2023-12-31', valid: true })}>
        Set Date Range
      </button>
    </div>
  ),
}));

vi.mock('@components/PmxGridItemTemplate', () => ({
  default: ({
    label,
    children,
    isError,
    isFetching,
    isUninitialized,
    refetch,
  }: {
    label: string;
    children: React.ReactNode;
    isError: boolean;
    isFetching: boolean;
    isUninitialized: boolean;
    refetch: () => void;
  }) => (
    <div data-testid={`pmx-grid-item-${label.replace(/\s+/g, '-').toLowerCase()}`}>
      <h3>{label}</h3>
      {isError && <span>Error</span>}
      {isFetching && <span>Fetching</span>}
      {isUninitialized && <span>Uninitialized</span>}
      <button onClick={refetch}>Refetch</button>
      {children}
    </div>
  ),
}));

vi.mock('@features/readiness-analytics/Training/HoursFlown/HoursFlown', () => ({
  default: ({
    uic,
    start_date,
    end_date,
    validDateRange,
  }: {
    uic: string;
    start_date: string;
    end_date: string;
    validDateRange: boolean;
  }) => (
    <div data-testid="hours-flown">
      Hours Flown: {uic}, {start_date}, {end_date}, {validDateRange ? 'valid' : 'invalid'}
    </div>
  ),
}));

vi.mock('@features/readiness-analytics/Training/MissionTypesFlown/MissionTypesFlown', () => ({
  default: ({
    data,
    uic,
    start_date,
    end_date,
    validDateRange,
  }: {
    data: unknown[];
    uic: string;
    start_date: string;
    end_date: string;
    validDateRange: boolean;
  }) => (
    <div data-testid="mission-types-flown">
      Mission Types: {data.length} items, {uic}, {start_date}, {end_date}, {validDateRange ? 'valid' : 'invalid'}
    </div>
  ),
}));

vi.mock('@features/readiness-analytics/Training/MissionsFlownGraph/MissionsFlownGraph', () => ({
  default: ({ data }: { data?: unknown[] }) => (
    <div data-testid="missions-flown-graph">Missions Flown Graph: {data ? data.length : 0} items</div>
  ),
}));

const mockUseAppSelector = vi.mocked(useAppSelector);
const mockUseGetHoursFlownUnitsQuery = vi.mocked(useGetHoursFlownUnitsQuery);
const mockUseGetMissionsFlownSummaryQuery = vi.mocked(useGetMissionsFlownSummaryQuery);
const mockUseGetMissionsFlownQuery = vi.mocked(useGetMissionsFlownQuery);

const mockStore = configureStore({
  reducer: {
    appSettings: () => ({
      currentUic: 'TEST123',
    }),
  },
});

describe('TrainingTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppSelector.mockReturnValue('TEST123');
    mockUseGetHoursFlownUnitsQuery.mockReturnValue({
      isError: false,
      isFetching: false,
      isUninitialized: false,
      refetch: vi.fn(),
    });
    mockUseGetMissionsFlownSummaryQuery.mockReturnValue({
      data: [{ type: 'Mission A' }, { type: 'Mission B' }],
      isError: false,
      isFetching: false,
      isUninitialized: false,
      refetch: vi.fn(),
    });
    mockUseGetMissionsFlownQuery.mockReturnValue({
      data: [{ mission: 'Mission 1' }, { mission: 'Mission 2' }],
      isError: false,
      isFetching: false,
      isUninitialized: false,
      refetch: vi.fn(),
    });
  });

  const renderComponent = () => {
    render(
      <Provider store={mockStore}>
        <ThemedTestingComponent>
          <TrainingTab />
        </ThemedTestingComponent>
      </Provider>,
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByTestId('tab-header')).toBeInTheDocument();
  });

  it('renders PmxDateRangeTabHeader and passes onDateChange', () => {
    renderComponent();
    const setDateButton = screen.getByText('Set Date Range');
    fireEvent.click(setDateButton);
    // After date change, queries should be called with date range
    expect(mockUseGetHoursFlownUnitsQuery).toHaveBeenCalledWith(
      { uic: 'TEST123', start_date: '2023-01-01', end_date: '2023-12-31' },
      { skip: false },
    );
  });

  it('renders HoursFlown component with correct props when date range is set', async () => {
    renderComponent();
    const setDateButton = screen.getByText('Set Date Range');
    fireEvent.click(setDateButton);
    await waitFor(() => {
      expect(screen.getByTestId('hours-flown')).toBeInTheDocument();
      expect(screen.getByText('Hours Flown: TEST123, 2023-01-01, 2023-12-31, valid')).toBeInTheDocument();
    });
  });

  it('renders MissionTypesFlown component with correct props', async () => {
    renderComponent();
    const setDateButton = screen.getByText('Set Date Range');
    fireEvent.click(setDateButton);
    await waitFor(() => {
      expect(screen.getByTestId('mission-types-flown')).toBeInTheDocument();
      expect(screen.getByText('Mission Types: 2 items, TEST123, 2023-01-01, 2023-12-31, valid')).toBeInTheDocument();
    });
  });

  it('renders MissionsFlownGraph component with correct props', async () => {
    renderComponent();
    const setDateButton = screen.getByText('Set Date Range');
    fireEvent.click(setDateButton);
    await waitFor(() => {
      expect(screen.getByTestId('missions-flown-graph')).toBeInTheDocument();
      expect(screen.getByText('Missions Flown Graph: 2 items')).toBeInTheDocument();
    });
  });

  it('skips queries when date range is invalid', () => {
    mockUseGetHoursFlownUnitsQuery.mockClear();
    renderComponent();
    // No date set, should skip
    expect(mockUseGetHoursFlownUnitsQuery).toHaveBeenCalledWith(
      { uic: 'TEST123', start_date: undefined, end_date: undefined },
      { skip: true },
    );
  });

  it('displays error state for HoursFlown', () => {
    mockUseGetHoursFlownUnitsQuery.mockReturnValue({
      isError: true,
      isFetching: false,
      isUninitialized: false,
      refetch: vi.fn(),
    });
    renderComponent();
    const setDateButton = screen.getByText('Set Date Range');
    fireEvent.click(setDateButton);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('displays fetching state for MissionsFlownSummary', () => {
    mockUseGetMissionsFlownSummaryQuery.mockReturnValue({
      data: [],
      isError: false,
      isFetching: true,
      isUninitialized: false,
      refetch: vi.fn(),
    });
    renderComponent();
    const setDateButton = screen.getByText('Set Date Range');
    fireEvent.click(setDateButton);
    expect(screen.getByText('Fetching')).toBeInTheDocument();
  });
});
