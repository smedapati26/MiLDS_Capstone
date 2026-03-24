/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { screen } from '@testing-library/react';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

// Mock the hooks
vi.mock('@hooks/useFilterOptions', () => ({
  useFilterOptions: vi.fn(),
}));

// Mock the components
vi.mock('@components/react-hook-form/RHFChipButtonGroup', () => ({
  RHFChipButtonGroup: ({ label, field, options }: { label: string; field: string; options: any[] }) => (
    <div data-testid={`rhf-chip-button-group-${field}`}>
      {label}: {options.map((opt: any) => (typeof opt === 'string' ? opt : opt.key || opt)).join(', ')}
    </div>
  ),
}));

vi.mock('@components/react-hook-form/RHFAutocomplete', () => ({
  RHFAutocomplete: ({
    field,
    label,
    options,
  }: {
    field: string;
    label: string;
    options: { label: string; value: string }[];
  }) => (
    <div data-testid={`rhf-multi-chip-autocomplete-${field}`}>
      {label}: {options.map((opt) => opt.label).join(', ')}
    </div>
  ),
}));

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

import { AircraftTransferFilterForm } from '@features/equipment-transfer/Transfer/Aircraft/AircraftTransferFilterForm';
import { useFilterOptions } from '@hooks/useFilterOptions';

import { IAircraftTransferData } from '@store/griffin_api/aircraft/models';


const mockUseFilterOptions = vi.mocked(useFilterOptions);

type TestForm = {
  statuses: string[];
  models: string[];
};

const renderWithForm = (ui: React.ReactElement) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm<TestForm>();
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  return renderWithProviders(<Wrapper>{ui}</Wrapper>);
};

const mockTableData: IAircraftTransferData[] = [
  {
    serial: 'SN001',
    unitShortName: 'Unit A',
    model: 'F-35',
    ORStatus: 'FMC',
  },
  {
    serial: 'SN002',
    unitShortName: 'Unit B',
    model: 'F-35',
    ORStatus: 'PMC',
  },
];

describe('AircraftTransferFilterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering with data', () => {
    beforeEach(() => {
      mockUseFilterOptions.mockImplementation((data, field) => {
        if (!data) return [];
        const values = (data as IAircraftTransferData[]).map((item) => item[field as keyof IAircraftTransferData]);
        const unique = [...new Set(values)].sort();
        return unique.map((val) => ({ label: String(val), value: String(val) }));
      });
    });

    it('renders all filter components', () => {
      renderWithForm(<AircraftTransferFilterForm tableData={mockTableData} onApplyFilters={() => {}} />);

      expect(screen.getByTestId('rhf-chip-button-group-statuses')).toBeInTheDocument();
      expect(screen.getByTestId('rhf-multi-chip-autocomplete-models')).toBeInTheDocument();
    });

    it('passes correct options to operational readiness status chip button group', () => {
      renderWithForm(<AircraftTransferFilterForm tableData={mockTableData} onApplyFilters={() => {}} />);

      const orStatusElement = screen.getByTestId('rhf-chip-button-group-statuses');
      expect(orStatusElement).toHaveTextContent('Operational Readiness Status: FMC, PMC, NMC');
    });

    it('passes correct options to models autocomplete', () => {
      renderWithForm(<AircraftTransferFilterForm tableData={mockTableData} onApplyFilters={() => {}} />);

      const modelsElement = screen.getByTestId('rhf-multi-chip-autocomplete-models');
      expect(modelsElement).toHaveTextContent('Models: F-35');
    });
  });

  describe('Rendering with empty data', () => {
    beforeEach(() => {
      mockUseFilterOptions.mockReturnValue([]);
    });

    it('renders with empty tableData', () => {
      renderWithForm(<AircraftTransferFilterForm tableData={[]} onApplyFilters={() => {}} />);

      expect(screen.getByTestId('rhf-chip-button-group-statuses')).toBeInTheDocument();
      expect(screen.getByTestId('rhf-multi-chip-autocomplete-models')).toBeInTheDocument();
    });

    it('passes empty options when no data', () => {
      renderWithForm(<AircraftTransferFilterForm tableData={[]} onApplyFilters={() => {}} />);

      const orStatusElement = screen.getByTestId('rhf-chip-button-group-statuses');
      expect(orStatusElement).toHaveTextContent('Operational Readiness Status: FMC, PMC, NMC');

      const modelsElement = screen.getByTestId('rhf-multi-chip-autocomplete-models');
      expect(modelsElement).toHaveTextContent('Models:');
    });
  });

  describe('Rendering with undefined data', () => {
    beforeEach(() => {
      mockUseFilterOptions.mockReturnValue([]);
    });

    it('renders with undefined tableData', () => {
      renderWithForm(<AircraftTransferFilterForm tableData={undefined} onApplyFilters={() => {}} />);

      expect(screen.getByTestId('rhf-chip-button-group-statuses')).toBeInTheDocument();
      expect(screen.getByTestId('rhf-multi-chip-autocomplete-models')).toBeInTheDocument();
    });
  });

  describe('Apply filters button', () => {
    it('calls onApplyFilters when apply button is clicked', () => {
      const onApplyFiltersMock = vi.fn();
      renderWithForm(<AircraftTransferFilterForm tableData={mockTableData} onApplyFilters={onApplyFiltersMock} />);

      const applyButton = screen.getByTestId('apply-button');
      applyButton.click();

      expect(onApplyFiltersMock).toHaveBeenCalled();
    });
  });
});