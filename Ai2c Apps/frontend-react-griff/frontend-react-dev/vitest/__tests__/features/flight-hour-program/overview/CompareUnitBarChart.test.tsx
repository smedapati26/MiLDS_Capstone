/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

import { act, fireEvent, screen } from '@testing-library/react';

import CompareUnitBarChart from '@features/flight-hour-program/overview/CompareUnitBarChart';

import { mapToAutoDsrSingleUnitInfo } from '@store/griffin_api/auto_dsr/models';
import { useGetAutoDsrSingleUnitInfoQuery } from '@store/griffin_api/auto_dsr/slices';
import { mapToIFhpProgressMulti } from '@store/griffin_api/fhp/models';
import { useGetFhpProgressMultipleUnitsQuery } from '@store/griffin_api/fhp/slices';
import { useAppSelector } from '@store/hooks';

import { renderWithProviders } from '@vitest/helpers';
import { mockAutoDsrSingleUnitInfoDto } from '@vitest/mocks/griffin_api_handlers/auto_dsr/mock_data';
import { mockFhpProgress, mockFhpProgressMultiDtoArray } from '@vitest/mocks/griffin_api_handlers/fhp/mock_data';

// Mock BarCard to just render its children
vi.mock('@features/flight-hour-program/overview/components/BarCard', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="bar-card">{children}</div>,
}));

// Mock FhpBarChart to inspect props
vi.mock('@features/flight-hour-program/overview/components/FhpStackedBarChart', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="fhp-bar-chart" data-chart-props={JSON.stringify(props)} />,
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

// Mock hooks
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));
vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetAutoDsrSingleUnitInfoQuery: vi.fn(),
}));

vi.mock('@store/griffin_api/fhp/slices', () => ({
  useGetFhpProgressMultipleUnitsQuery: vi.fn(),
}));

describe('CompareUnitBarChart Component', () => {
  beforeEach(() => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('mock-uic');
    (useGetAutoDsrSingleUnitInfoQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mapToAutoDsrSingleUnitInfo(mockAutoDsrSingleUnitInfoDto),
      isLoading: false,
    });
    (useGetFhpProgressMultipleUnitsQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockFhpProgressMultiDtoArray.map(mapToIFhpProgressMulti),
      isLoading: false,
    });
  });

  it('renders the title, multi-select, and chart', async () => {
    await act(async () => {
      renderWithProviders(<CompareUnitBarChart data={mockFhpProgress} startDate="2025-01-01" endDate="2025-02-01" />);
    });
    expect(screen.getByText('Compare Unit')).toBeInTheDocument();
    expect(screen.getByTestId('multi-select')).toBeInTheDocument();
    expect(screen.getByTestId('fhp-bar-chart')).toBeInTheDocument();
  });

  it('renders options in the multi-select', async () => {
    await act(async () => {
      renderWithProviders(<CompareUnitBarChart data={mockFhpProgress} startDate="2025-01-01" endDate="2025-02-01" />);
    });
    expect(screen.getByText('short uic1')).toBeInTheDocument();
    expect(screen.getByText('short uic2')).toBeInTheDocument();
  });

  it('calls onChange and updates selected units', async () => {
    await act(async () => {
      renderWithProviders(<CompareUnitBarChart data={mockFhpProgress} startDate="2025-01-01" endDate="2025-02-01" />);
    });
    const select = screen.getByTestId('multi-select') as HTMLSelectElement;
    // Deselect "Unit 2"
    fireEvent.change(select, { target: { value: 'short uic1' } });
    // The chart should still be rendered
    expect(screen.getByTestId('fhp-bar-chart')).toBeInTheDocument();
  });

  it('passes correct chartData to FhpBarChart', async () => {
    await act(async () => {
      renderWithProviders(<CompareUnitBarChart data={mockFhpProgress} startDate="2025-01-01" endDate="2025-02-01" />);
    });
    const chart = screen.getByTestId('fhp-bar-chart');
    const chartProps = JSON.parse(chart.getAttribute('data-chart-props')!);
    expect(chartProps.series.labels).toEqual(['10/2025']);
    expect(chartProps.series.datasets[0].label).toBe('short name Flight Hours');
  });

  it('includes line datasets for each filtered similar unit', async () => {
    // Arrange: set up mocks so filteredUnitData is non-empty
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('mock-uic');
    (useGetAutoDsrSingleUnitInfoQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        shortName: 'short name',
        similarUnits: [
          { uic: 'uic1', shortName: 'short uic1' },
          { uic: 'uic2', shortName: 'short uic2' },
        ],
      },
      isLoading: false,
    });
    (useGetFhpProgressMultipleUnitsQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        {
          uic: 'uic1',
          data: {
            unit: [
              { date: new Date('2025-01-01'), actualFlightHours: 5 },
              { date: new Date('2025-02-01'), actualFlightHours: 7 },
            ],
          },
        },
        {
          uic: 'uic2',
          data: {
            unit: [
              { date: new Date('2025-01-01'), actualFlightHours: 8 },
              { date: new Date('2025-02-01'), actualFlightHours: 9 },
            ],
          },
        },
      ],
      isLoading: false,
    });

    await act(async () => {
      renderWithProviders(<CompareUnitBarChart data={mockFhpProgress} startDate="2025-01-01" endDate="2025-02-01" />);
    });

    const chart = screen.getByTestId('fhp-bar-chart');
    const chartProps = JSON.parse(chart.getAttribute('data-chart-props')!);

    // There should be 1 bar dataset and 2 line datasets
    expect(chartProps.series.datasets.length).toBe(3);

    // The line datasets should have the correct labels and data
    const line1 = chartProps.series.datasets.find((ds: any) => ds.label === 'short uic1 Flight Hours');
    const line2 = chartProps.series.datasets.find((ds: any) => ds.label === 'short uic2 Flight Hours');
    expect(line1).toBeDefined();
    expect(line2).toBeDefined();
    expect(line1.data).toEqual([5, 7]);
    expect(line2.data).toEqual([8, 9]);
    expect(line1.type).toBe('line');
    expect(line2.type).toBe('line');
  });
});
