import { describe, expect, it, vi } from 'vitest';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AgseFilterForm } from '@features/daily-status-report/components/EquipmentDetails/AGSE/AgseFilterForm';
import { useFilterOptions } from '@hooks/useFilterOptions';

const mockUseFilterOptions = vi.mocked(useFilterOptions);

import { IAGSE } from '@store/griffin_api/agse/models';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

// Mock the custom components
vi.mock('@components/react-hook-form/RHFFilterFormProvider', () => ({
  RHFFilterFormProvider: vi.fn(({ children, title, defaultValues, onSubmitFilters }) => (
    <div data-testid="rhf-filter-form-provider">
      <div>{title}</div>
      <div data-testid="filter-children">{children}</div>
      <button data-testid="apply-button" onClick={() => onSubmitFilters && onSubmitFilters(defaultValues)}>
        Apply
      </button>
    </div>
  )),
}));

vi.mock('@components/react-hook-form/RHFChipButtonGroup', () => ({
  RHFChipButtonGroup: vi.fn(({ label, field, options }) => (
    <div data-testid={`rhf-chip-button-group-${field}`}>
      <div>{label}</div>
      {options.map((option: string) => (
        <button key={option} data-testid={`chip-button-${option}`}>
          {option}
        </button>
      ))}
    </div>
  )),
}));

vi.mock('@components/react-hook-form/RHFAutocomplete', () => ({
  RHFAutocomplete: vi.fn(({ field, label, options }) => (
    <div data-testid={`rhf-multi-chip-autocomplete-${field}`}>
      <div>{label}</div>
      <div data-testid={`autocomplete-options-${field}`}>
        {options?.map((option: { key: string; label: string }) => (
          <div key={option.key} data-testid={`option-${field}-${option.key}`}>
            {option.label}
          </div>
        ))}
      </div>
    </div>
  )),
}));

vi.mock('@hooks/useFilterOptions', () => {
  return {
    useFilterOptions: vi.fn(),
  };
});

// Mock the schema and default values
vi.mock('@features/daily-status-report/components/EquipmentDetails/AGSE/schema', () => ({
  AgseFilterSchema: {},
  agseDefaultValues: {
    conditions: null,
    serialNumbers: [],
    models: [],
    units: [],
    location: [],
  },
}));

// Mock the enum
vi.mock('@models/OperationalReadinessStatusEnum', () => ({
  OperationalReadinessStatusEnum: {
    FMC: 'FMC',
    PMC: 'PMC',
    NMC: 'NMC',
    DADE: 'DADE',
  },
}));

describe('AgseFilterForm', () => {
  const mockTableData: IAGSE[] = [
    {
      equipmentNumber: 'EQ001',
      lin: 'LIN001',
      serialNumber: 'SN001',
      condition: 'FMC',
      currentUnit: 'UNIT001',
      currentUnitShortName: 'UNIT001',
      nomenclature: 'Nomen1',
      displayName: 'Display1',
      earliestNmcStart: '2023-01-01',
      model: 'Model1',
      daysNmc: 0,
      remarks: 'Remarks1',
      location: null,
      status: 'FMC',
      earliestNmcStartCount: null,
    },
    {
      equipmentNumber: 'EQ002',
      lin: 'LIN002',
      serialNumber: 'SN002',
      condition: 'PMC',
      currentUnit: 'UNIT002',
      currentUnitShortName: 'UNIT002',
      nomenclature: 'Nomen2',
      displayName: 'Display2',
      earliestNmcStart: '2023-01-02',
      model: 'Model2',
      daysNmc: 1,
      remarks: 'Remarks2',
      location: null,
      status: 'PMC',
      earliestNmcStartCount: null,
    },
  ];

  const mockOnApplyFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct title', () => {
    mockUseFilterOptions.mockReturnValue([]);

    renderWithProviders(<AgseFilterForm tableData={mockTableData} onApplyFilters={mockOnApplyFilters} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('renders the chip button group for operational readiness conditions', () => {
    mockUseFilterOptions.mockReturnValue([]);

    renderWithProviders(<AgseFilterForm tableData={mockTableData} onApplyFilters={mockOnApplyFilters} />);

    expect(screen.getByTestId('rhf-chip-button-group-conditions')).toBeInTheDocument();
    expect(screen.getByText('Operational Readiness Status')).toBeInTheDocument();
    expect(screen.getByTestId('chip-button-FMC')).toBeInTheDocument();
    expect(screen.getByTestId('chip-button-PMC')).toBeInTheDocument();
    expect(screen.getByTestId('chip-button-NMC')).toBeInTheDocument();
    expect(screen.getByTestId('chip-button-DADE')).toBeInTheDocument();
  });

  it('renders multi-chip autocompletes for serial numbers, models, units, and location', () => {
    mockUseFilterOptions.mockReturnValue([
      { key: 'value1', label: 'Value 1' },
      { key: 'value2', label: 'Value 2' },
    ]);

    renderWithProviders(<AgseFilterForm tableData={mockTableData} onApplyFilters={mockOnApplyFilters} />);

    expect(screen.getByTestId('rhf-multi-chip-autocomplete-serialNumbers')).toBeInTheDocument();
    expect(screen.getByText('Serial Numbers')).toBeInTheDocument();

    expect(screen.getByTestId('rhf-multi-chip-autocomplete-models')).toBeInTheDocument();
    expect(screen.getByText('Models')).toBeInTheDocument();

    expect(screen.getByTestId('rhf-multi-chip-autocomplete-units')).toBeInTheDocument();
    expect(screen.getByText('Unit')).toBeInTheDocument();

    expect(screen.getByTestId('rhf-multi-chip-autocomplete-location')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  it('calls useFilterOptions with correct parameters', () => {
    mockUseFilterOptions.mockReturnValue([]);

    renderWithProviders(<AgseFilterForm tableData={mockTableData} onApplyFilters={mockOnApplyFilters} />);

    expect(mockUseFilterOptions).toHaveBeenCalledWith(mockTableData, 'serialNumber');
    expect(mockUseFilterOptions).toHaveBeenCalledWith(mockTableData, 'model');
    expect(mockUseFilterOptions).toHaveBeenCalledWith(mockTableData, 'currentUnit');
    expect(mockUseFilterOptions).toHaveBeenCalledWith(mockTableData, 'lin');
  });

  it('passes filter options to autocompletes', () => {
    const mockOptions = [
      { key: 'SN001', label: 'SN001' },
      { key: 'SN002', label: 'SN002' },
    ];
    mockUseFilterOptions.mockReturnValue(mockOptions);

    renderWithProviders(<AgseFilterForm tableData={mockTableData} onApplyFilters={mockOnApplyFilters} />);

    expect(screen.getByTestId('option-serialNumbers-SN001')).toBeInTheDocument();
    expect(screen.getByTestId('option-serialNumbers-SN002')).toBeInTheDocument();
  });

  it('calls onApplyFilters when apply button is clicked', async () => {
    mockUseFilterOptions.mockReturnValue([]);

    const user = userEvent.setup();

    renderWithProviders(<AgseFilterForm tableData={mockTableData} onApplyFilters={mockOnApplyFilters} />);

    const applyButton = screen.getByText('Apply');
    await user.click(applyButton);

    expect(mockOnApplyFilters).toHaveBeenCalledWith({
      conditions: null,
      serialNumbers: [],
      models: [],
      units: [],
      location: [],
    });
  });

  it('handles empty tableData gracefully', () => {
    mockUseFilterOptions.mockReturnValue([]);

    renderWithProviders(<AgseFilterForm tableData={[]} onApplyFilters={mockOnApplyFilters} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(mockUseFilterOptions).toHaveBeenCalledWith([], 'serialNumber');
  });
});
