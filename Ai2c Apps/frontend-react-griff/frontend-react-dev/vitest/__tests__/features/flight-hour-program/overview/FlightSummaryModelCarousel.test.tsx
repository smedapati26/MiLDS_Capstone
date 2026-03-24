/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

import { act, fireEvent, screen } from '@testing-library/react';

import FlightSummaryModelCarousel from '@features/flight-hour-program/overview/FlightSummaryModelCarousel';

import { renderWithProviders } from '@vitest/helpers';

// Mock PmxCarousel to just render its children
vi.mock('@components/PmxCarousel', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="carousel">{children}</div>,
}));

// Mock PmxMultiSelect to just render a select and call onChange
vi.mock('@components/PmxMultiSelect', () => ({
  __esModule: true,
  default: ({ label, options, values, onChange }: any) => (
    <div>
      <label>{label}</label>
      <select
        data-testid="multi-select"
        multiple
        value={values}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
          onChange(selected);
        }}
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  ),
}));

// Mock SummaryBarChart to inspect props
vi.mock('@features/flight-hour-program/overview/SummaryBarChart', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="summary-bar-chart"
      data-chart-title={props.title}
      data-condensed={props.condensed}
      data-showmodels={props.showModels}
      data-iscoarousel={props.isCarousel ? 'true' : 'false'}
    />
  ),
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

describe('FlightSummaryModelCarousel Component', () => {
  it('renders the carousel and multi-select', async () => {
    await act(async () => {
      renderWithProviders(<FlightSummaryModelCarousel data={mockData} height={300} />);
    });
    expect(screen.getByTestId('fhp-summary-model-carousel')).toBeInTheDocument();
    expect(screen.getByTestId('multi-select')).toBeInTheDocument();
    expect(screen.getByTestId('carousel')).toBeInTheDocument();
  });

  it('renders a SummaryBarChart for each model', async () => {
    await act(async () => {
      renderWithProviders(<FlightSummaryModelCarousel data={mockData} height={300} />);
    });
    const charts = screen.getAllByTestId('summary-bar-chart');
    expect(charts).toHaveLength(2);
    expect(charts[0]).toHaveAttribute('data-chart-title', 'Model A');
    expect(charts[1]).toHaveAttribute('data-chart-title', 'Model B');
  });

  it('renders options in the multi-select', async () => {
    await act(async () => {
      renderWithProviders(<FlightSummaryModelCarousel data={mockData} height={300} />);
    });
    expect(screen.getByText('Model A')).toBeInTheDocument();
    expect(screen.getByText('Model B')).toBeInTheDocument();
  });

  it('filters models when multi-select changes', async () => {
    await act(async () => {
      renderWithProviders(<FlightSummaryModelCarousel data={mockData} height={300} />);
    });
    const select = screen.getByTestId('multi-select') as HTMLSelectElement;
    // Select only "Model A"
    Array.from(select.options).forEach((option) => (option.selected = option.value === 'Model A'));
    fireEvent.change(select);

    // Only one chart should be rendered now
    const charts = screen.getAllByTestId('summary-bar-chart');
    expect(charts).toHaveLength(1);
    expect(charts[0]).toHaveAttribute('data-chart-title', 'Model A');
  });

  it('passes condensed, showModels, and isCarousel props to SummaryBarChart', async () => {
    await act(async () => {
      renderWithProviders(<FlightSummaryModelCarousel data={mockData} height={300} />);
    });
    const charts = screen.getAllByTestId('summary-bar-chart');
    charts.forEach((chart) => {
      expect(chart).toHaveAttribute('data-condensed', 'true');
      expect(chart).toHaveAttribute('data-showmodels', 'true');
      // isCarousel should be false because filteredData.length <= 2
      expect(chart).toHaveAttribute('data-iscoarousel', 'false');
    });
  });
});
