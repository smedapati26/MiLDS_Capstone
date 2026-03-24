import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import FailureCountsComponent, {
  FailureCountsComponentProps,
} from '@features/component-management/components/Analytics/FailureCountsComponent';

import { useGetFailureCountQuery } from '@store/griffin_api/components/slices/componentsApi';

import { ThemedTestingComponent } from '@vitest/helpers/ThemedTestingComponent';

import '@testing-library/jest-dom';

vi.mock('@hooks/useDebounce', () => ({
  useDebounce: vi.fn((value) => [value]),
}));
vi.mock('@store/griffin_api/components/slices/componentsApi', () => ({
  useGetFailureCountQuery: vi.fn(),
}));
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Skeleton: (props: any) => <div data-testid="skeleton" {...props} />,
  };
});

vi.mock('@components/PmxSlider', () => ({
  default: ({
    value,
    handleChange,
    label,
  }: {
    value: number;
    handleChange: (event: Event | null, value: number | number[]) => void;
    label: string;
  }) => (
    <div data-testid="pmx-slider">
      <label>{label}</label>
      <input
        type="range"
        value={value.toString()}
        onChange={(e) => handleChange(null, parseInt(e.target.value))}
        data-testid="slider-input"
      />
      Value: {value}
    </div>
  ),
}));

vi.mock('@components/PmxAccordion', () => ({
  default: ({
    heading,
    children,
    isLoading,
  }: {
    heading: React.ReactNode;
    children: React.ReactNode;
    isLoading?: boolean;
  }) => (
    <div data-testid="pmx-accordion">
      {isLoading ? <div>Loading...</div> : <div>{heading}</div>}
      <div>{children}</div>
    </div>
  ),
}));

vi.mock('@components/PmxErrorDisplay', () => ({
  default: ({ onRefresh }: { onRefresh: () => void }) => (
    <div data-testid="pmx-error-display">
      Error occurred
      <button onClick={onRefresh} data-testid="refresh-button">
        Refresh
      </button>
    </div>
  ),
}));

const mockUseGetFailureCountQuery = vi.mocked(useGetFailureCountQuery);

const mockStore = configureStore({
  reducer: {
    appSettings: () => ({ currentUnit: { uic: 'TEST123', name: 'Test Unit' } }),
  },
});

describe('FailureCountsComponent', () => {
  const defaultProps: FailureCountsComponentProps = {
    uic: 'TEST123',
    selectedModels: [],
    selectedSerials: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetFailureCountQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
      isFetching: false,
      refetch: vi.fn(),
    });
  });

  const renderComponent = (props = defaultProps) => {
    render(
      <Provider store={mockStore}>
        <ThemedTestingComponent>
          <Suspense fallback={<div>Loading...</div>}>
            <FailureCountsComponent {...props} />
          </Suspense>
        </ThemedTestingComponent>
      </Provider>,
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Failure Counts')).toBeInTheDocument();
  });

  it('displays loading skeleton when isLoading is true', () => {
    mockUseGetFailureCountQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
      isFetching: false,
      refetch: vi.fn(),
    });
    renderComponent();
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('displays message when no interaction has occurred', () => {
    renderComponent();
    expect(screen.getByText('Make selections to view failure data.')).toBeInTheDocument();
  });

  it('renders failure data when data is available and hasInteracted is true', async () => {
    const mockData = [
      {
        nomenclature: 'PART-001',
        model: 'MODEL-001',
        serial: 'SERIAL-001',
        failureChance: 0.5,
      },
      {
        nomenclature: 'PART-001',
        model: 'MODEL-001',
        serial: 'SERIAL-002',
        failureChance: 0.3,
      },
    ];

    mockUseGetFailureCountQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: undefined,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderComponent();

    // Simulate interaction by changing slider
    const sliders = screen.getAllByTestId('slider-input');
    const slider = sliders[0];
    fireEvent.change(slider, { target: { value: '10' } });

    await waitFor(() => {
      expect(screen.getByText('PART-001')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // failuresCount
    });
  });

  it('filters data based on selectedModels', async () => {
    const mockData = [
      {
        nomenclature: 'PART-001',
        model: 'MODEL-001',
        serial: 'SERIAL-001',
        failureChance: 0.5,
      },
      {
        nomenclature: 'PART-002',
        model: 'MODEL-002',
        serial: 'SERIAL-002',
        failureChance: 0.3,
      },
    ];

    mockUseGetFailureCountQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: undefined,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderComponent({ ...defaultProps, selectedModels: ['MODEL-001'] });

    // Simulate interaction
    const sliders = screen.getAllByTestId('slider-input');
    const slider = sliders[0];
    fireEvent.change(slider, { target: { value: '10' } });

    await waitFor(() => {
      expect(screen.getByText('PART-001')).toBeInTheDocument();
      expect(screen.queryByText('PART-002')).not.toBeInTheDocument();
    });
  });

  it('filters data based on selectedSerials', async () => {
    const mockData = [
      {
        nomenclature: 'PART-001',
        model: 'MODEL-001',
        serial: 'SERIAL-001',
        failureChance: 0.5,
      },
      {
        nomenclature: 'PART-002',
        model: 'MODEL-002',
        serial: 'SERIAL-002',
        failureChance: 0.3,
      },
    ];

    mockUseGetFailureCountQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: undefined,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderComponent({ ...defaultProps, selectedSerials: ['SERIAL-001'] });

    // Simulate interaction
    const sliders = screen.getAllByTestId('slider-input');
    const slider = sliders[0];
    fireEvent.change(slider, { target: { value: '10' } });

    await waitFor(() => {
      expect(screen.getByText('PART-001')).toBeInTheDocument();
      expect(screen.queryByText('PART-002')).not.toBeInTheDocument();
    });
  });

  it('displays error component when error occurs', () => {
    const mockRefetch = vi.fn();
    mockUseGetFailureCountQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Test error' },
      isFetching: false,
      refetch: mockRefetch,
    });

    renderComponent();

    expect(screen.getByTestId('pmx-error-display')).toBeInTheDocument();

    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('updates failureVal state on slider change', () => {
    renderComponent();

    const sliders = screen.getAllByTestId('slider-input');
    const slider = sliders[0];
    fireEvent.change(slider, { target: { value: '20' } });

    expect(screen.getByText('Value: 20')).toBeInTheDocument();
  });

  it('updates futureHour state on slider change and rounds to nearest 5', () => {
    renderComponent();

    const sliders = screen.getAllByTestId('slider-input');
    const futureHourSlider = sliders[1]; // Assuming second slider is for futureHour

    fireEvent.change(futureHourSlider, { target: { value: '23' } });

    // Should round to 25
    expect(screen.getByText('Value: 25')).toBeInTheDocument();
  });
});
