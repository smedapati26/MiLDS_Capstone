/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

import { act, screen } from '@testing-library/react';

import ModelPredictionBarChart from '@features/flight-hour-program/overview/ModelPredictionBarChart';

import { renderWithProviders } from '@vitest/helpers';

// Mock BarCard to just render its children
vi.mock('@features/flight-hour-program/overview/components/BarCard', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="bar-card">{children}</div>,
}));

// Mock FhpDashedBarChart to inspect props
vi.mock('@features/flight-hour-program/overview/components/FhpDashedBarChart', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="fhp-bar-chart" data-chart-props={JSON.stringify(props)} />,
}));

// Mock groupByFamilyAndSumDates
const mockGroupByFamilyAndSumDates = vi.fn();
vi.mock('@features/flight-hour-program/overview/components/helper', () => ({
  groupByFamilyAndSumDates: (models: any) => mockGroupByFamilyAndSumDates(models),
}));

const mockData = {
  unit: [
    { date: new Date('2025-01-01'), actualFlightHours: 10, projectedFlightHours: 20, predictedFlightHours: 30 },
    { date: new Date('2025-02-01'), actualFlightHours: 15, projectedFlightHours: 25, predictedFlightHours: 35 },
  ],
  models: [
    {
      family: 'CHINOOK',
      model: 'CH-47F',
      dates: [
        { date: new Date('2025-01-01'), actualFlightHours: 10, projectedFlightHours: 20, predictedFlightHours: 0 },
        { date: new Date('2025-02-01'), actualFlightHours: 15, projectedFlightHours: 25, predictedFlightHours: 0 },
      ],
    },
    {
      family: 'BLACK HAWK',
      model: 'HH-60M',
      dates: [
        { date: new Date('2025-01-01'), actualFlightHours: 5, projectedFlightHours: 12, predictedFlightHours: 0 },
        { date: new Date('2025-02-01'), actualFlightHours: 7, projectedFlightHours: 14, predictedFlightHours: 0 },
      ],
    },
  ],
};

describe('ModelPredictionBarChart', () => {
  beforeEach(() => {
    mockGroupByFamilyAndSumDates.mockReset();
    mockGroupByFamilyAndSumDates.mockReturnValue([
      {
        family: 'CHINOOK',
        dates: [
          { date: new Date('2025-01-01'), actualFlightHours: 10, projectedFlightHours: 20 },
          { date: new Date('2025-02-01'), actualFlightHours: 15, projectedFlightHours: 25 },
        ],
      },
      {
        family: 'BLACK HAWK',
        dates: [
          { date: new Date('2025-01-01'), actualFlightHours: 5, projectedFlightHours: 12 },
          { date: new Date('2025-02-01'), actualFlightHours: 7, projectedFlightHours: 14 },
        ],
      },
    ]);
  });

  it('renders the title and chart', async () => {
    await act(async () => {
      renderWithProviders(<ModelPredictionBarChart data={mockData} height={300} />);
    });
    expect(screen.getByText('Model Predictions')).toBeInTheDocument();
    expect(screen.getByTestId('fhp-bar-chart')).toBeInTheDocument();
  });

  it('passes correct chartData to FhpDashedBarChart', async () => {
    await act(async () => {
      renderWithProviders(<ModelPredictionBarChart data={mockData} height={300} />);
    });
    const chart = screen.getByTestId('fhp-bar-chart');
    const chartProps = JSON.parse(chart.getAttribute('data-chart-props')!);

    // Should have labels for each unit date
    expect(chartProps.series.labels).toEqual(['01/2025', '02/2025']);

    // Should have 4 datasets: 2 families x (lower + upper)
    expect(chartProps.series.datasets.length).toBe(4);

    // Check lower and upper for CHINOOK
    const chinookDatasets = chartProps.series.datasets.filter((ds: any) => ds.stack === 'CHINOOK');
    chinookDatasets[0].isTop = false;
    chinookDatasets[1].isTop = true;
    expect(chinookDatasets.length).toBe(2);

    // The lower dataset should have isTop: false, the upper should have isTop: true
    const chinookLower = chinookDatasets.find((ds: any) => ds.isTop === false);
    const chinookUpper = chinookDatasets.find((ds: any) => ds.isTop === true);
    expect(chinookLower.data).toEqual([10, 15]);
    expect(chinookUpper.data).toEqual([10, 10]); // 20-10, 25-15, but since projected > actual, upper is 0

    // Check lower and upper for BLACK HAWK
    const blackHawkDatasets = chartProps.series.datasets.filter((ds: any) => ds.stack === 'BLACK HAWK');
    expect(blackHawkDatasets.length).toBe(2);
    blackHawkDatasets[0].isTop = false;
    blackHawkDatasets[1].isTop = true;
    const blackHawkLower = blackHawkDatasets.find((ds: any) => ds.isTop === false);
    const blackHawkUpper = blackHawkDatasets.find((ds: any) => ds.isTop === true);
    expect(blackHawkLower.data).toEqual([5, 7]);
    expect(blackHawkUpper.data).toEqual([7, 7]);
  });

  it('renders with dashed prop set to true', async () => {
    await act(async () => {
      renderWithProviders(<ModelPredictionBarChart data={mockData} height={300} />);
    });
    const chart = screen.getByTestId('fhp-bar-chart');
    const chartProps = JSON.parse(chart.getAttribute('data-chart-props')!);
    expect(chartProps.dashed).toBe(true);
  });
});
