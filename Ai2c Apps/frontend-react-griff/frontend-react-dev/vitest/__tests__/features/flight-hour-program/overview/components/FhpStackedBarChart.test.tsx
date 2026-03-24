/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChartData } from 'chart.js';

import { screen } from '@testing-library/react';

import FhpStackedBarChart from '@features/flight-hour-program/overview/components/FhpStackedBarChart';

import { renderWithProviders } from '@vitest/helpers';

// Mock FhpChartsLegend to test dashed prop
vi.mock('@features/flight-hour-program/overview/components/FhpChartsLegend', () => ({
  __esModule: true,
  default: ({ dashed, series }: { dashed?: boolean; series: any }) => (
    <div data-testid={dashed ? 'fhp-legend-dashed' : 'fhp-legend'}>
      {series.map((ds: any) => (
        <span key={ds.label}>{ds.label}</span>
      ))}
    </div>
  ),
}));

const mockSeries: ChartData<'bar' | 'line', number[], string> = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [
    {
      label: 'Actual Flight Hours',
      data: [100, 200, 150],
      backgroundColor: 'blue',
      borderColor: 'black',
      type: 'bar',
    },
    {
      label: 'Projected Flight Hours',
      data: [120, 210, 160],
      backgroundColor: 'gray',
      borderColor: 'black',
      type: 'bar',
    },
  ],
};

describe('FhpBarChart', () => {
  it('renders the legend with correct labels', () => {
    renderWithProviders(<FhpStackedBarChart series={mockSeries} title="Test Chart" height={300} />);
    expect(screen.getByText('Actual Flight Hours')).toBeInTheDocument();
    expect(screen.getByText('Projected Flight Hours')).toBeInTheDocument();
    expect(screen.getByTestId('fhp-legend')).toBeInTheDocument();
  });

  it('renders the chart container with correct height', () => {
    renderWithProviders(<FhpStackedBarChart series={mockSeries} title="Test Chart" height={400} />);
    const chartContainer = screen.getByTestId('chart-container');
    expect(chartContainer).toHaveStyle({ height: '400px' });
  });

  it('renders the chart (canvas) inside the container', () => {
    renderWithProviders(<FhpStackedBarChart series={mockSeries} title="Test Chart" height={300} />);
    // Chart.js renders a canvas inside the container
    const chartContainer = screen.getByTestId('chart-container');
    const canvas = chartContainer.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders dashed legend when dashed prop is true', () => {
    renderWithProviders(<FhpStackedBarChart series={mockSeries} title="Test Chart" height={300} dashed />);
    expect(screen.getByTestId('fhp-legend-dashed')).toBeInTheDocument();
    expect(screen.getByText('Actual Flight Hours')).toBeInTheDocument();
    expect(screen.getByText('Projected Flight Hours')).toBeInTheDocument();
  });
});
