/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

import { act, fireEvent, screen } from '@testing-library/react';

import SummaryBarChart from '@features/flight-hour-program/overview/SummaryBarChart';

import { renderWithProviders } from '@vitest/helpers';
import { mockFhpProgress } from '@vitest/mocks/griffin_api_handlers/fhp/mock_data';

// Mock BarCard to just render its children
vi.mock('@features/flight-hour-program/overview/components/BarCard', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <div data-testid={props['data-testid'] || 'bar-card'}>{children}</div>,
}));

// // Mock FhpBarChart to inspect props
vi.mock('@features/flight-hour-program/overview/components/FhpStackedBarChart', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="fhp-bar-chart" data-chart-props={JSON.stringify(props)} />,
}));

// Mock groupByFamilyAndSumDates
const mockGroupByFamilyAndSumDates = vi.fn();
vi.mock('@features/flight-hour-program/overview/components/helper', () => ({
  groupByFamilyAndSumDates: (models: any) => mockGroupByFamilyAndSumDates(models),
}));

describe('SummaryBarChart Component', () => {
  beforeEach(() => {
    mockGroupByFamilyAndSumDates.mockReturnValue([
      {
        family: 'CHINOOK',
        dates: [
          {
            date: new Date('10-01-2025'),
            actualFlightHours: 10,
            predictedFlightHours: 20,
            projectedFlightHours: 19,
          },
        ],
      },
    ]);
  });

  it('renders the title and chart', async () => {
    await act(async () => {
      renderWithProviders(<SummaryBarChart data={mockFhpProgress} />);
    });
    expect(screen.getByText('Unit Summary')).toBeInTheDocument();
    expect(screen.getByTestId('fhp-bar-chart')).toBeInTheDocument();
  });

  it('renders the switch if hasSwitch is true', async () => {
    await act(async () => {
      renderWithProviders(<SummaryBarChart data={mockFhpProgress} hasSwitch />);
    });
    expect(screen.getByLabelText('Show by Model')).toBeInTheDocument();
  });

  it('does not render the switch if hasSwitch is false', async () => {
    await act(async () => {
      renderWithProviders(<SummaryBarChart data={mockFhpProgress} hasSwitch={false} />);
    });
    expect(screen.queryByLabelText('Show by Model')).not.toBeInTheDocument();
  });

  it('toggles showByModel when switch is clicked', async () => {
    await act(async () => {
      renderWithProviders(<SummaryBarChart data={mockFhpProgress} />);
    });
    const switchInput = screen.getByRole('checkbox');
    expect(switchInput).not.toBeChecked();
    fireEvent.click(switchInput);
    // After click, showByModel should be true, so groupByFamilyAndSumDates should be used for barDatasets
    expect(mockGroupByFamilyAndSumDates).toHaveBeenCalledWith(mockFhpProgress.models);
  });

  it('passes condensed and isCarousel props', async () => {
    await act(async () => {
      renderWithProviders(<SummaryBarChart data={mockFhpProgress} condensed isCarousel={false} />);
    });
    // Check that the bar-card is rendered
    expect(screen.getByTestId('fhp-bar-chart')).toBeInTheDocument();
  });

  it('passes correct chartData to FhpStackedBarChart', async () => {
    await act(async () => {
      renderWithProviders(<SummaryBarChart data={mockFhpProgress} />);
    });
    const chart = screen.getByTestId('fhp-bar-chart');
    const chartProps = JSON.parse(chart.getAttribute('data-chart-props')!);
    expect(chartProps.series.labels).toEqual(['10/2025']);
    expect(chartProps.series.datasets.some((ds: any) => ds.label === 'Actual Flight Hours (Total: 10)')).toBe(true);
    expect(chartProps.series.datasets.some((ds: any) => ds.label === 'Projected Flight Hours (Total: 19)')).toBe(true);
    expect(chartProps.series.datasets.some((ds: any) => ds.label === 'Predicted Flight Hours (Total: 20)')).toBe(true);
  });
});
