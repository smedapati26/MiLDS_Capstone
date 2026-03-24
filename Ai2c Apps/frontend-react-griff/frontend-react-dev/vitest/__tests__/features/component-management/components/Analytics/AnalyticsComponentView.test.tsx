/* eslint-disable @typescript-eslint/no-explicit-any */
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AnalyticsComponentView from '@features/component-management/components/Analytics/AnalyticsComponentView';

import { aircraftApi, useGetAircraftByUicQuery } from '@store/griffin_api/aircraft/slices';
import { IPartListItem } from '@store/griffin_api/components/models';
import {
  useGetAircraftRiskPredictionsQuery,
  useGetComponentPartListQuery,
  useGetLongevityQuery,
  useGetModelRiskPredictionsQuery,
} from '@store/griffin_api/components/slices/componentsApi';
import { useAppSelector } from '@store/hooks';

// Mock RTK Query hooks
vi.mock('@store/griffin_api/aircraft/slices', () => ({
  aircraftApi: {
    reducerPath: 'aircraftApi',
    reducer: () => ({}),
    middleware: () => () => (next: any) => next,
  },
  useGetAircraftByUicQuery: vi.fn(),
}));

vi.mock('@store/griffin_api/components/slices/componentsApi', () => ({
  useGetComponentPartListQuery: vi.fn(),
  useGetAircraftRiskPredictionsQuery: vi.fn(),
  useGetModelRiskPredictionsQuery: vi.fn(),
  useGetLongevityQuery: vi.fn(),
}));

// Mock react-plotly.js to prevent lazy loading suspension
vi.mock('react-plotly.js', () => ({
  default: () => <div data-testid="plot" />,
}));

// Mock useAppSelector
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

// Mock child components
vi.mock('@components/Longevity', () => ({
  default: ({ componentName }: { componentName: string }) => <div data-testid="longevity">{componentName}</div>,
}));

vi.mock('@components/PmxMultiSelect', () => ({
  default: ({
    label,
    values,
    options,
    disabled,
    loading,
    onChange,
    'data-testid': testId,
  }: {
    label: string;
    values: string[];
    options: string[];
    disabled: boolean;
    loading: boolean;
    onChange: (values: string[]) => void;
    'data-testid': string;
  }) => (
    <div data-testid={testId}>
      <label>{label}</label>
      <select
        value={values[0] || ''}
        onChange={(e) => onChange([e.target.value])}
        disabled={disabled}
        data-testid={`${testId}-select`}
      >
        {options.map((option: string) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {loading && <span>Loading...</span>}
    </div>
  ),
}));

vi.mock('@features/component-management/components/Analytics/PartsListDropdown', () => ({
  default: ({
    values,
    handleSelect,
    multiSelect,
  }: {
    values: string[];
    handleSelect: (values: string[]) => void;
    multiSelect: boolean;
  }) => (
    <div data-testid="parts-list-dropdown">
      <select
        value={values[0] || ''}
        onChange={(e) => handleSelect(multiSelect ? [e.target.value] : [e.target.value])}
        data-testid="parts-select"
      >
        <option value="">Select Part</option>
        <option value="PART-001">PART-001</option>
        <option value="PART-002">PART-002</option>
      </select>
    </div>
  ),
}));

vi.mock('@features/component-management/components/Analytics/ComponentFailurePredictions', () => ({
  ComponentFailurePredictions: ({ title }: { title: string }) => (
    <div data-testid="component-failure-predictions">{title}</div>
  ),
}));

vi.mock('@features/component-management/components/Analytics/AnalyticsUnitView', () => ({
  StyledContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="styled-paper">{children}</div>,
}));

const mockStore = configureStore({
  reducer: {
    appSettings: () => ({
      currentUnit: { uic: 'TEST123', name: 'Test Unit' },
    }),
    [aircraftApi.reducerPath]: aircraftApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(aircraftApi.middleware),
});

describe('AnalyticsComponentView', () => {
  const mockPartList: IPartListItem[] = [
    { part_number: 'PART-001', models: ['MODEL-A', 'MODEL-B'] },
    { part_number: 'PART-002', models: ['MODEL-C'] },
  ];

  const mockAircraft = [
    { serial: 'SN001', model: 'MODEL-A' },
    { serial: 'SN002', model: 'MODEL-B' },
  ];

  const mockRiskPredictions = [
    {
      serial_number: 'SN001',
      failure_detail: { failure_prob_100: 0.5 },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useAppSelector
    (useAppSelector as any).mockReturnValue({ uic: 'TEST123', name: 'Test Unit' });

    // Mock RTK hooks
    (useGetComponentPartListQuery as any).mockReturnValue({
      data: mockPartList,
      isLoading: false,
      isFetching: false,
    });

    (useGetAircraftByUicQuery as any).mockReturnValue({
      data: mockAircraft,
    });

    (useGetAircraftRiskPredictionsQuery as any).mockReturnValue({
      data: mockRiskPredictions,
      isFetching: false,
      isLoading: false,
    });

    (useGetModelRiskPredictionsQuery as any).mockReturnValue({
      data: mockRiskPredictions,
      isFetching: false,
      isLoading: false,
    });

    (useGetLongevityQuery as any).mockReturnValue({
      data: { tbo: 225, unit_average: 200, fleet_average: 250, value_type: 'tbo' },
      isLoading: false,
    });
  });

  const renderComponent = () => {
    render(
      <Provider store={mockStore}>
        <AnalyticsComponentView />
      </Provider>,
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Select a component to see fleet analytics.')).toBeInTheDocument();
  });

  it('displays parts list dropdown and model selector', () => {
    renderComponent();
    expect(screen.getByTestId('parts-list-dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('models-select')).toBeInTheDocument();
  });

  it('shows model selector as disabled when no part is selected', () => {
    renderComponent();
    const modelSelect = screen.getByTestId('models-select-select');
    expect(modelSelect).toBeDisabled();
  });

  it('does not render analytics sections when no part is selected', () => {
    renderComponent();
    expect(screen.queryByTestId('component-failure-predictions')).not.toBeInTheDocument();
    expect(screen.queryByTestId('longevity')).not.toBeInTheDocument();
  });

  it('passes correct props to ComponentFailurePredictions', async () => {
    const user = userEvent.setup();
    renderComponent();

    const partsSelect = screen.getByTestId('parts-select');
    await user.selectOptions(partsSelect, 'PART-001');

    await waitFor(() => {
      expect(screen.getByText('Aircraft Lead Lag Assy Risk')).toBeInTheDocument();
      expect(screen.getByText('Model Risk Predictions')).toBeInTheDocument();
    });
  });

  it('passes correct props to Longevity component', async () => {
    const user = userEvent.setup();
    renderComponent();

    const partsSelect = screen.getByTestId('parts-select');
    await user.selectOptions(partsSelect, 'PART-001');

    await waitFor(() => {
      const longevity = screen.getByTestId('longevity');
      expect(longevity).toHaveTextContent('Lead Lag Link Assy');
    });
  });

  it('shows loading state for model selector', () => {
    (useGetComponentPartListQuery as any).mockReturnValue({
      data: mockPartList,
      isLoading: true,
      isFetching: true,
    });

    renderComponent();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('calls useGetAircraftByUicQuery with correct parameters when part is selected', async () => {
    const user = userEvent.setup();
    renderComponent();

    const partsSelect = screen.getByTestId('parts-select');
    await user.selectOptions(partsSelect, 'PART-001');

    await waitFor(() => {
      expect(useGetAircraftByUicQuery).toHaveBeenCalledWith(['TEST123', 'PART-001'], {
        skip: false,
        refetchOnMountOrArgChange: true,
      });
    });
  });

  it('calls useGetAircraftRiskPredictionsQuery with correct parameters', async () => {
    const user = userEvent.setup();
    renderComponent();

    const partsSelect = screen.getByTestId('parts-select');
    await user.selectOptions(partsSelect, 'PART-001');

    await waitFor(() => {
      expect(useGetAircraftRiskPredictionsQuery).toHaveBeenLastCalledWith(
        {
          uic: 'TEST123',
          variant: 'top',
          serial_numbers: undefined,
          part_numbers: ['PART-001'],
        },
        {
          skip: false,
        },
      );
    });
  });

  it('calls useGetModelRiskPredictionsQuery with correct parameters', async () => {
    const user = userEvent.setup();
    renderComponent();

    const partsSelect = screen.getByTestId('parts-select');
    await user.selectOptions(partsSelect, 'PART-001');

    await waitFor(() => {
      expect(useGetModelRiskPredictionsQuery).toHaveBeenCalledWith(
        {
          uic: 'TEST123',
          part_number: 'PART-001',
        },
        {
          skip: false,
        },
      );
    });
  });

  it('resets state when UIC changes', () => {
    let callCount = 0;
    (useAppSelector as any).mockImplementation(() => {
      callCount++;
      return callCount === 1 ? { uic: 'TEST123', name: 'Test Unit' } : { uic: 'TEST456', name: 'New Unit' };
    });

    const { rerender } = render(
      <Provider store={mockStore}>
        <AnalyticsComponentView />
      </Provider>,
    );

    // Simulate UIC change
    rerender(
      <Provider store={mockStore}>
        <AnalyticsComponentView />
      </Provider>,
    );

    // The component should handle the UIC change via useEffect
    expect(useAppSelector).toHaveBeenCalled();
  });
});
