/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, it, vi } from 'vitest';

import { fireEvent, screen } from '@testing-library/react';

import { AgseTable, AgseTableProps } from '@features/daily-status-report/components/EquipmentDetails/AGSE/AgseTable';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

// Mock RTK Query hook
vi.mock('@store/griffin_api/agse/slices', () => ({
  useGetAGSEQuery: vi.fn(),
}));

// Mock hooks
vi.mock('@hooks/useTableSearchOptions', () => ({
  useTableSearchOptions: vi.fn(),
}));

vi.mock('@features/daily-status-report/components/EquipmentDetails/AGSE/useAgseTableFilter', () => ({
  useAgseTableFilter: vi.fn(),
}));

// Mock components
vi.mock('@ai2c/pmx-mui', async () => {
  const actual = await vi.importActual('@ai2c/pmx-mui');
  return {
    ...actual,
    SearchBar: ({ onChange }: any) => (
      <div data-testid="search-bar">
        <input onChange={(e) => onChange(null, { value: e.target.value })} />
      </div>
    ),
  };
});

vi.mock('@components/data-tables', () => ({
  PmxTable: ({ columns, rows, isLoading }: any) => (
    <div data-testid="pmx-table">
      {columns?.length || 0} columns, {rows?.length || 0} rows, loading: {isLoading ? 'true' : 'false'}
    </div>
  ),
  PmxTableWrapper: ({ leftControls, rightControls, table }: any) => (
    <div data-testid="pmx-table-wrapper">
      <div data-testid="left-controls">{leftControls}</div>
      <div data-testid="right-controls">{rightControls}</div>
      <div data-testid="table">{table}</div>
    </div>
  ),
}));

vi.mock('@components/inputs', async () => {
  const actual = await vi.importActual('@components/inputs');
  return {
    ...actual,
    PmxToggleButtonGroup: ({ options, onChange }: any) => (
      <div data-testid="pmx-toggle-button-group">
        {options.map((option: string) => (
          <button key={option} data-testid={`toggle-${option}`} onClick={() => onChange()}>
            {option}
          </button>
        ))}
      </div>
    ),
  };
});

vi.mock('@features/daily-status-report/components/EquipmentDetails/AGSE/AgseFilterForm', () => ({
  AgseFilterForm: ({ onApplyFilters }: any) => (
    <div data-testid="agse-filter-form">
      <button data-testid="apply-filters" onClick={() => onApplyFilters({ testFilter: 'value' })}>
        Apply Filters
      </button>
    </div>
  ),
}));

import { useAgseTableFilter } from '@features/daily-status-report/components/EquipmentDetails/AGSE/useAgseTableFilter';
import { useTableSearchOptions } from '@hooks/useTableSearchOptions';

import { useGetAGSEQuery } from '@store/griffin_api/agse/slices';

describe('AgseTable', () => {
  const mockTableData = [
    {
      serialNumber: 'SN001',
      model: 'Model1',
      displayName: 'Name1',
      remarks: 'Remark1',
      condition: 'MC',
      currentUnit: 'Unit1',
      lin: 'Loc1',
      daysNmc: 5,
    },
  ];
  const mockSearchOptions = [{ label: 'SN001', value: 'SN001' }];
  const mockFilteredRows = [{ serialNumber: 'SN001' }];

  beforeEach(() => {
    (useGetAGSEQuery as any).mockReturnValue({
      data: { agse: mockTableData },
      isLoading: false,
    });
    (useTableSearchOptions as any).mockReturnValue(mockSearchOptions);
    (useAgseTableFilter as any).mockReturnValue(mockFilteredRows);
  });

  const defaultProps: AgseTableProps = {
    uic: 'test-uic',
    onToggle: vi.fn(),
  };

  it('renders the component with all controls', () => {
    renderWithProviders(<AgseTable {...defaultProps} />);

    expect(screen.getByTestId('pmx-table-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('left-controls')).toBeInTheDocument();
    expect(screen.getByTestId('right-controls')).toBeInTheDocument();
    expect(screen.getByTestId('table')).toBeInTheDocument();
    expect(screen.getByTestId('pmx-toggle-button-group')).toBeInTheDocument();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('agse-filter-form')).toBeInTheDocument();
  });

  it('renders PmxTable with correct props', () => {
    renderWithProviders(<AgseTable {...defaultProps} />);

    const table = screen.getByTestId('pmx-table');
    expect(table).toHaveTextContent('7 columns');
    expect(table).toHaveTextContent('1 rows');
    expect(table).toHaveTextContent('loading: false');
  });

  it('calls onToggle when toggle button is clicked', () => {
    renderWithProviders(<AgseTable {...defaultProps} />);

    const toggleButton = screen.getByTestId('toggle-Aircraft');
    fireEvent.click(toggleButton);

    expect(defaultProps.onToggle).toHaveBeenCalled();
  });

  it('updates searchQuery when typing in search bar', () => {
    renderWithProviders(<AgseTable {...defaultProps} />);

    const searchInput = screen.getByTestId('search-bar').querySelector('input') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    // Since searchQuery is internal state, we can check that useAgseTableFilter is called with the new query
    expect(useAgseTableFilter).toHaveBeenCalledWith({
      tableData: mockTableData,
      searchQuery: 'test search',
      filters: expect.any(Object),
      columns: expect.any(Array),
    });
  });

  it('updates filters when filters are applied', () => {
    renderWithProviders(<AgseTable {...defaultProps} />);

    const applyButton = screen.getByTestId('apply-filters');
    fireEvent.click(applyButton);

    // Check that useAgseTableFilter is called with updated filters
    expect(useAgseTableFilter).toHaveBeenCalledWith({
      tableData: mockTableData,
      searchQuery: '',
      filters: { testFilter: 'value' },
      columns: expect.any(Array),
    });
  });

  it('passes correct uic to useGetAGSEQuery hook', () => {
    renderWithProviders(<AgseTable {...defaultProps} />);

    expect(useGetAGSEQuery).toHaveBeenCalledWith('test-uic', { skip: false });
  });

  it('skips query when uic is undefined', () => {
    const propsWithoutUic: AgseTableProps = { uic: undefined, onToggle: vi.fn() };
    renderWithProviders(<AgseTable {...propsWithoutUic} />);

    expect(useGetAGSEQuery).toHaveBeenCalledWith(undefined, { skip: true });
  });
});
