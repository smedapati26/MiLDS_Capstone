/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { screen } from '@testing-library/react';

import { AircraftEquipmentFilterForm } from '@features/daily-status-report/components/EquipmentDetails/Aircraft/AircraftEquipmentFilterForm';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

// Mock the hooks
vi.mock('@hooks/useFilterOptions', () => ({
  useFilterOptions: vi.fn(),
}));

vi.mock('@hooks/useMaxValue', () => ({
  useMaxValue: vi.fn(),
}));

vi.mock('@features/daily-status-report/components/EquipmentDetails/Aircraft/useModifications', () => ({
  useModifications: vi.fn(),
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

vi.mock('@components/react-hook-form/RHFDualRangeSlider', () => ({
  RHFDualRangeSlider: ({
    field,
    checkboxName: _checkboxName,
    label,
    max,
  }: {
    field: string;
    checkboxName: string;
    label: string;
    max: number;
  }) => (
    <div data-testid={`rhf-dual-range-slider-${field}`}>
      {label}: max {max}
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

import { TableOverrideType } from '@features/daily-status-report/components/EquipmentDetails/Aircraft/AircraftTable';
import { useModifications } from '@features/daily-status-report/components/EquipmentDetails/Aircraft/useModifications';
import { useFilterOptions } from '@hooks/useFilterOptions';
import { useMaxValue } from '@hooks/useMaxValue';

import { IAutoDsr, IMod } from '@store/griffin_api/auto_dsr/models';

const mockUseFilterOptions = vi.mocked(useFilterOptions);
const mockUseMaxValue = vi.mocked(useMaxValue);
const mockUseModifications = vi.mocked(useModifications);

type TestForm = {
  launchStatus: string;
  orStatus: string[];
  serialNumbers: string[];
  models: string[];
  units: string[];
  location: string[];
  modifications: string[];
  hoursFlown: [number, number];
  isHoursFlownChecked: boolean;
  hoursToPhase: [number, number];
  isHoursToPhaseChecked: boolean;
};

const renderWithForm = (ui: React.ReactElement) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm<TestForm>();

    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  return renderWithProviders(<Wrapper>{ui}</Wrapper>);
};

const mockTableData: TableOverrideType[] = [
  {
    serialNumber: 'SN001',
    owningUnitUic: 'UIC1',
    owningUnitName: 'Unit A',
    currentUnitUic: 'UIC1',
    currentUnitName: 'Unit A',
    location: 'Base 1',
    model: 'F-35',
    status: 'FMC',
    rtl: 'RTL',
    remarks: '',
    dateDown: '2023-01-01',
    dateDownCount: 0,
    ecd: '2023-12-31',
    hoursToPhase: 200,
    flyingHours: 100,
    lastSyncTime: '2023-01-01T00:00:00Z',
    lastExportUploadTime: '2023-01-01T00:00:00Z',
    lastUserEditTime: '2023-01-01T00:00:00Z',
    dataUpdateTime: '2023-01-01T00:00:00Z',
    modifications: [],
  },
  {
    serialNumber: 'SN002',
    owningUnitUic: 'UIC2',
    owningUnitName: 'Unit B',
    currentUnitUic: 'UIC2',
    currentUnitName: 'Unit B',
    location: 'Base 2',
    model: 'F-35',
    status: 'PMC',
    rtl: 'NRTL',
    remarks: '',
    dateDown: '2023-01-02',
    dateDownCount: 0,
    ecd: '2023-12-31',
    hoursToPhase: 250,
    flyingHours: 150,
    lastSyncTime: '2023-01-02T00:00:00Z',
    lastExportUploadTime: '2023-01-02T00:00:00Z',
    lastUserEditTime: '2023-01-02T00:00:00Z',
    dataUpdateTime: '2023-01-02T00:00:00Z',
    modifications: [],
  },
];

describe('AircraftEquipmentFilterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering with data', () => {
    beforeEach(() => {
      mockUseFilterOptions.mockImplementation((data, field) => {
        if (!data) return [];
        const values = (data as IAutoDsr[]).map((item) => item[field as keyof IAutoDsr]);
        const unique = [...new Set(values)].sort();
        return unique.map((val) => ({ label: String(val), value: String(val) }));
      });

      mockUseMaxValue.mockImplementation((data, field) => {
        if (!data) return 0;
        const values = (data as IAutoDsr[]).map((item) => Number(item[field as keyof IAutoDsr]));
        return Math.ceil(Math.max(...values) / 5) * 5;
      });

      mockUseModifications.mockImplementation((data) => {
        if (!data) return [];
        const values = data.flatMap((row) => row.modifications.map((mod: IMod) => mod.modType));
        const unique = [...new Set(values)].sort();
        return unique.map((val) => ({ label: val, value: val }));
      });
    });

    it('renders all filter components', () => {
      renderWithForm(<AircraftEquipmentFilterForm tableData={mockTableData} onApplyFilters={() => { }} />);

      expect(screen.getByTestId('rhf-chip-button-group-launchStatus')).toBeInTheDocument();
      expect(screen.getByTestId('rhf-chip-button-group-orStatus')).toBeInTheDocument();
      expect(screen.getByTestId('rhf-multi-chip-autocomplete-serialNumbers')).toBeInTheDocument();
      expect(screen.getByTestId('rhf-multi-chip-autocomplete-models')).toBeInTheDocument();
      expect(screen.getByTestId('rhf-multi-chip-autocomplete-units')).toBeInTheDocument();
      expect(screen.getByTestId('rhf-multi-chip-autocomplete-location')).toBeInTheDocument();
      expect(screen.getByTestId('rhf-multi-chip-autocomplete-modifications')).toBeInTheDocument();
      expect(screen.getByTestId('rhf-dual-range-slider-hoursFlown')).toBeInTheDocument();
      expect(screen.getByTestId('rhf-dual-range-slider-hoursToPhase')).toBeInTheDocument();
    });

    it('passes correct options to launch status chip button group', () => {
      renderWithForm(<AircraftEquipmentFilterForm tableData={mockTableData} onApplyFilters={() => { }} />);

      const launchStatusElement = screen.getByTestId('rhf-chip-button-group-launchStatus');
      expect(launchStatusElement).toHaveTextContent('Launch Status: RTL, NRTL');
    });

    it('passes correct options to operational readiness status chip button group', () => {
      renderWithForm(<AircraftEquipmentFilterForm tableData={mockTableData} onApplyFilters={() => { }} />);

      const orStatusElement = screen.getByTestId('rhf-chip-button-group-orStatus');
      expect(orStatusElement).toHaveTextContent('Operational Readiness Status: FMC, PMC, NMC, DADE');
    });

    it('passes correct options to serial numbers autocomplete', () => {
      renderWithForm(<AircraftEquipmentFilterForm tableData={mockTableData} onApplyFilters={() => { }} />);

      const serialNumbersElement = screen.getByTestId('rhf-multi-chip-autocomplete-serialNumbers');
      expect(serialNumbersElement).toHaveTextContent('Serial Numbers: SN001, SN002');
    });

    it('passes correct options to models autocomplete', () => {
      renderWithForm(<AircraftEquipmentFilterForm tableData={mockTableData} onApplyFilters={() => { }} />);

      const modelsElement = screen.getByTestId('rhf-multi-chip-autocomplete-models');
      expect(modelsElement).toHaveTextContent('Models: F-35');
    });

    it('passes correct options to units autocomplete', () => {
      renderWithForm(<AircraftEquipmentFilterForm tableData={mockTableData} onApplyFilters={() => { }} />);

      const unitsElement = screen.getByTestId('rhf-multi-chip-autocomplete-units');
      expect(unitsElement).toHaveTextContent('Unit: Unit A, Unit B');
    });

    it('passes correct options to location autocomplete', () => {
      renderWithForm(<AircraftEquipmentFilterForm tableData={mockTableData} onApplyFilters={() => { }} />);

      const locationElement = screen.getByTestId('rhf-multi-chip-autocomplete-location');
      expect(locationElement).toHaveTextContent('Location: Base 1, Base 2');
    });

    it('passes correct max to hours flown slider', () => {
      renderWithForm(<AircraftEquipmentFilterForm tableData={mockTableData} onApplyFilters={() => { }} />);

      const hoursFlownElement = screen.getByTestId('rhf-dual-range-slider-hoursFlown');
      expect(hoursFlownElement).toHaveTextContent('Hours Flown: max 150');
    });

    it('passes correct max to hours to phase slider', () => {
      renderWithForm(<AircraftEquipmentFilterForm tableData={mockTableData} onApplyFilters={() => { }} />);

      const hoursToPhaseElement = screen.getByTestId('rhf-dual-range-slider-hoursToPhase');
      expect(hoursToPhaseElement).toHaveTextContent('Hours to Phase: max 250');
    });
  });

  describe('Rendering with empty data', () => {
    beforeEach(() => {
      mockUseFilterOptions.mockReturnValue([]);
      mockUseMaxValue.mockReturnValue(0);
    });

    it('renders with empty tableData', () => {
      renderWithForm(<AircraftEquipmentFilterForm tableData={[]} onApplyFilters={() => { }} />);

      expect(screen.getByTestId('rhf-chip-button-group-launchStatus')).toBeInTheDocument();
      expect(screen.getByTestId('rhf-multi-chip-autocomplete-serialNumbers')).toBeInTheDocument();
      expect(screen.getByTestId('rhf-dual-range-slider-hoursFlown')).toBeInTheDocument();
    });

    it('passes empty options when no data', () => {
      renderWithForm(<AircraftEquipmentFilterForm tableData={[]} onApplyFilters={() => { }} />);

      const serialNumbersElement = screen.getByTestId('rhf-multi-chip-autocomplete-serialNumbers');
      expect(serialNumbersElement).toHaveTextContent('Serial Numbers:');
    });

    it('passes max 0 when no data', () => {
      renderWithForm(<AircraftEquipmentFilterForm tableData={[]} onApplyFilters={() => { }} />);

      const hoursFlownElement = screen.getByTestId('rhf-dual-range-slider-hoursFlown');
      expect(hoursFlownElement).toHaveTextContent('Hours Flown: max 0');
    });
  });

  describe('Rendering with undefined data', () => {
    beforeEach(() => {
      mockUseFilterOptions.mockReturnValue([]);
      mockUseMaxValue.mockReturnValue(0);
    });

    it('renders with undefined tableData', () => {
      renderWithForm(<AircraftEquipmentFilterForm tableData={undefined} onApplyFilters={() => { }} />);

      expect(screen.getByTestId('rhf-chip-button-group-launchStatus')).toBeInTheDocument();
    });
  });

  describe('Apply filters button', () => {
    it('calls onApplyFilters when apply button is clicked', () => {
      const onApplyFiltersMock = vi.fn();
      renderWithForm(<AircraftEquipmentFilterForm tableData={mockTableData} onApplyFilters={onApplyFiltersMock} />);

      const applyButton = screen.getByTestId('apply-button');
      applyButton.click();

      expect(onApplyFiltersMock).toHaveBeenCalled();
    });
  });
});
