import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from 'vitest/helpers/renderWithProviders';

import { fireEvent, screen } from '@testing-library/react';

import { UAVFilterForm } from '@features/daily-status-report/components/EquipmentDetails/UAS/UAV/UAVFilterForm';

import { IUAS } from '@store/griffin_api/uas/models/IUAS';

// Mock the custom hook
vi.mock('@hooks/useFilterOptions', () => ({
  useFilterOptions: vi.fn(),
}));

// Mock the custom components
vi.mock('@components/react-hook-form', () => ({
  RHFAutocomplete: ({ label }: { label: string }) => <div data-testid={`autocomplete-${label}`}>{label}</div>,
  RHFDualRangeSlider: ({ label }: { label: string }) => <div data-testid={`dual-slider-${label}`}>{label}</div>,
  RHFFilterFormProvider: ({
    children,
    onSubmitFilters,
  }: {
    children: React.ReactNode;
    onSubmitFilters: (filters: Record<string, unknown>) => void;
  }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitFilters({});
      }}
      data-testid="filter-form"
    >
      {children}
      <button type="submit" data-testid="submit-button">
        Apply
      </button>
    </form>
  ),
}));

vi.mock('@components/react-hook-form/RHFChipButtonGroup', () => ({
  RHFChipButtonGroup: ({ label }: { label: string }) => <div data-testid={`chip-group-${label}`}>{label}</div>,
}));

// Import after mocking
import { useFilterOptions } from '@hooks/useFilterOptions';

const mockUseFilterOptions = vi.mocked(useFilterOptions);

describe('UAVFilterForm', () => {
  const mockOnApplyFilters = vi.fn();
  const sampleTableData: IUAS[] = [
    {
      id: '1',
      serialNumber: 'SN001',
      model: 'ModelA',
      currentUnit: 'Unit1',
      locationCode: 'Loc1',
      locationName: 'Location1',
      status: 'FMC',
      displayStatus: 'FMC',
      rtl: false,
      shortName: '',
      shouldSync: false,
      fieldSyncStatus: {},
      // Add minimal required properties to satisfy IUAS type
    } as unknown as IUAS,
    {
      id: '2',
      serialNumber: 'SN002',
      model: 'ModelB',
      currentUnit: 'Unit2',
      locationCode: 'Loc2',
      locationName: 'Location2',
      status: 'PMC',
      displayStatus: 'PMC',
      rtl: false,
      shortName: '',
      shouldSync: false,
      fieldSyncStatus: {},
    } as unknown as IUAS,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFilterOptions.mockReturnValue(['Option1', 'Option2']);
  });

  it('renders the filter form with default props', () => {
    renderWithProviders(<UAVFilterForm tableData={[]} onApplyFilters={mockOnApplyFilters} />);

    expect(screen.getByTestId('filter-form')).toBeInTheDocument();
    expect(screen.getByTestId('chip-group-Operational Readiness Status')).toBeInTheDocument();
    expect(screen.getByTestId('autocomplete-Serial Numbers')).toBeInTheDocument();
    expect(screen.getByTestId('autocomplete-Models')).toBeInTheDocument();
    expect(screen.getByTestId('autocomplete-Unit')).toBeInTheDocument();
    expect(screen.getByTestId('autocomplete-Location')).toBeInTheDocument();
  });

  it('calls useFilterOptions with correct parameters', () => {
    renderWithProviders(<UAVFilterForm tableData={sampleTableData} onApplyFilters={mockOnApplyFilters} />);

    expect(mockUseFilterOptions).toHaveBeenCalledWith(sampleTableData, 'serialNumber');
    expect(mockUseFilterOptions).toHaveBeenCalledWith(sampleTableData, 'model');
    expect(mockUseFilterOptions).toHaveBeenCalledWith(sampleTableData, 'currentUnit');
    expect(mockUseFilterOptions).toHaveBeenCalledWith(sampleTableData, 'locationCode');
  });

  it('calls onApplyFilters when form is submitted', () => {
    renderWithProviders(<UAVFilterForm tableData={sampleTableData} onApplyFilters={mockOnApplyFilters} />);

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    expect(mockOnApplyFilters).toHaveBeenCalledWith({});
  });
});
