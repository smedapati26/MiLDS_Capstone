/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

import { act, fireEvent, screen } from '@testing-library/react';

import FlightSummaryCarousel from '@features/flight-hour-program/overview/FlightSummaryCarousel';

import { renderWithProviders } from '@vitest/helpers';

// Mock child components
vi.mock('@components/PmxCarousel', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="carousel">{children}</div>,
}));
vi.mock('@features/flight-hour-program/overview/SummaryBarChart', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="summary-bar-chart" data-title={props.title} />,
}));
vi.mock('@features/flight-hour-program/overview/CompareUnitBarChart', () => ({
  __esModule: true,
  default: () => <div data-testid="compare-unit-bar-chart" />,
}));
vi.mock('@features/flight-hour-program/overview/ModelPredictionBarChart', () => ({
  __esModule: true,
  default: () => <div data-testid="model-prediction-bar-chart" />,
}));
vi.mock('@features/flight-hour-program/overview/FlightSummaryModelCarousel', () => ({
  __esModule: true,
  default: () => <div data-testid="flight-summary-model-carousel" />,
}));

// Mock hooks
const mockUseAppSelector = vi.fn();
const mockUseGetFhpProgressQuery = vi.fn();

vi.mock('@store/hooks', () => ({
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));
vi.mock('@store/griffin_api/fhp/slices', () => ({
  useGetFhpProgressQuery: (...args: any[]) => mockUseGetFhpProgressQuery(...args),
}));
vi.mock('@store/slices', () => ({
  selectCurrentUic: (state: any) => state,
}));

const mockData = {
  unit: [
    { date: new Date('2025-01-01'), actualFlightHours: 10, projectedFlightHours: 20, predictedFlightHours: 30 },
    { date: new Date('2025-02-01'), actualFlightHours: 15, projectedFlightHours: 25, predictedFlightHours: 35 },
  ],
  models: [
    {
      model: 'Model A',
      family: 'CHINOOK',
      dates: [
        { date: new Date('2025-01-01'), actualFlightHours: 10, projectedFlightHours: 20, predictedFlightHours: 0 },
        { date: new Date('2025-02-01'), actualFlightHours: 15, projectedFlightHours: 25, predictedFlightHours: 0 },
      ],
    },
    {
      model: 'Model B',
      family: 'BLACK HAWK',
      dates: [
        { date: new Date('2025-01-01'), actualFlightHours: 5, projectedFlightHours: 12, predictedFlightHours: 0 },
        { date: new Date('2025-02-01'), actualFlightHours: 7, projectedFlightHours: 14, predictedFlightHours: 0 },
      ],
    },
  ],
};

const mockDateRange = {
  startDate: '2025-01-01',
  endDate: '2025-02-01',
  valid: true,
};

describe('FlightSummaryCarousel Component', () => {
  beforeEach(() => {
    mockUseAppSelector.mockReturnValue('mock-uic');
    mockUseGetFhpProgressQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      isFetching: false,
    });
  });

  it('renders loading skeleton when loading', async () => {
    mockUseGetFhpProgressQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      isFetching: true,
    });
    await act(async () => {
      renderWithProviders(<FlightSummaryCarousel dateRange={mockDateRange} />);
    });
    expect(screen.getByTestId('skeleton-fhp-summary-carousel-loading')).toBeInTheDocument();
  });

  it('renders the carousel and all unit summary charts by default', async () => {
    await act(async () => {
      renderWithProviders(<FlightSummaryCarousel dateRange={mockDateRange} />);
    });
    expect(screen.getByTestId('fhp-summary-carousel')).toBeInTheDocument();
    expect(screen.getByTestId('carousel')).toBeInTheDocument();
    expect(screen.getByTestId('summary-bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('compare-unit-bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('model-prediction-bar-chart')).toBeInTheDocument();
  });

  it('renders the toggle and switches to model summary', async () => {
    await act(async () => {
      renderWithProviders(<FlightSummaryCarousel dateRange={mockDateRange} />);
    });
    const toggle = screen.getByTestId('fhp-summary-toggle');
    expect(toggle).toBeInTheDocument();
    // Click the "model" toggle button
    const modelButton = screen.getByRole('button', { name: /model/i });
    fireEvent.click(modelButton);
    // Now the model carousel should be rendered
    expect(screen.getByTestId('flight-summary-model-carousel')).toBeInTheDocument();
  });

  it('does not render charts if no data', async () => {
    mockUseGetFhpProgressQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      isFetching: false,
    });
    await act(async () => {
      renderWithProviders(<FlightSummaryCarousel dateRange={mockDateRange} />);
    });
    // Should not find any chart components
    expect(screen.queryByTestId('summary-bar-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('compare-unit-bar-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('model-prediction-bar-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('flight-summary-model-carousel')).not.toBeInTheDocument();
  });
});
