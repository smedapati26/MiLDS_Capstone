import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { screen } from '@testing-library/react';

import { MaintDetailsFilterForm } from '@features/daily-status-report/components/MaintenanceDetails/MaintDetailsFilterForm';
import { useFilterOptions } from '@hooks/useFilterOptions';

import { IMaintenanceDetailsDto } from '@store/griffin_api/events/models';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

// Mock custom hooks
vi.mock('@hooks/useFilterOptions', () => ({
  useFilterOptions: vi.fn(() => ['option1', 'option2']),
}));

// Mock custom components
vi.mock('@components/react-hook-form', () => ({
  RHFFilterFormProvider: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="filter-form-provider">
      {title}
      {children}
    </div>
  ),
  RHFAutocomplete: () => <div data-testid="multi-chip-autocomplete" />,
}));

vi.mock('@components/react-hook-form/RHFDateRangePicker', () => ({
  default: () => <div data-testid="date-range-picker" />,
}));

vi.mock('@components/react-hook-form/RHFDualRangeSlider', () => ({
  RHFDualRangeSlider: () => <div data-testid="dual-range-slider" />,
}));

describe('MaintDetailsFilterForm Component', () => {
  const mockTableData: IMaintenanceDetailsDto[] = [
    {
      serial: '123',
      model: 'model1',
      inspection_name: 'insp1',
      status: 50,
      lane_name: 'lane1',
      responsible_unit: 'unit1',
      start_date: '2023-01-01',
      end_date: '2023-01-02',
      current_upcoming: 'current',
    },
  ];
  const mockOnApplyFilters = vi.fn();

  it('renders the component without crashing', () => {
    renderWithProviders(<MaintDetailsFilterForm tableData={mockTableData} onApplyFilters={mockOnApplyFilters} />);

    expect(screen.getByTestId('filter-form-provider')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('renders all filter components', () => {
    renderWithProviders(<MaintDetailsFilterForm tableData={mockTableData} onApplyFilters={mockOnApplyFilters} />);

    // Check for multiple RHFAutocomplete instances (5 of them)
    expect(screen.getAllByTestId('multi-chip-autocomplete')).toHaveLength(5);

    // Check for RHFDateRangePicker instances (2 of them)
    expect(screen.getAllByTestId('date-range-picker')).toHaveLength(2);

    // Check for RHFDualRangeSlider
    expect(screen.getByTestId('dual-range-slider')).toBeInTheDocument();
  });

  it('calls useFilterOptions with correct parameters', () => {
    renderWithProviders(<MaintDetailsFilterForm tableData={mockTableData} onApplyFilters={mockOnApplyFilters} />);

    expect(useFilterOptions).toHaveBeenCalledWith(mockTableData, 'serial');
    expect(useFilterOptions).toHaveBeenCalledWith(mockTableData, 'model');
    expect(useFilterOptions).toHaveBeenCalledWith(mockTableData, 'inspection_name');
    expect(useFilterOptions).toHaveBeenCalledWith(mockTableData, 'lane_name');
    expect(useFilterOptions).toHaveBeenCalledWith(mockTableData, 'responsible_unit');
  });

  it('renders with empty tableData', () => {
    renderWithProviders(<MaintDetailsFilterForm tableData={[]} onApplyFilters={mockOnApplyFilters} />);

    expect(screen.getByTestId('filter-form-provider')).toBeInTheDocument();
  });

  it('renders with undefined tableData', () => {
    renderWithProviders(<MaintDetailsFilterForm tableData={undefined} onApplyFilters={mockOnApplyFilters} />);

    expect(screen.getByTestId('filter-form-provider')).toBeInTheDocument();
  });
});
