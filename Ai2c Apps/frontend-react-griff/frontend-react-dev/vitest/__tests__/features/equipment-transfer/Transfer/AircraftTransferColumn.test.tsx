import { describe, expect, it } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import { ColumnConfig } from '@components/data-tables';
import AircraftTransferColumn, { AircraftTransferColumnProps } from "@features/equipment-transfer/Transfer/Aircraft/AircraftTransferColumn";
import { transientUnit } from '@features/equipment-transfer/Transfer/Aircraft/helper';

import { IAircraftTransferData } from '@store/griffin_api/aircraft/models';

import { ProviderWrapper } from '@vitest/helpers';


const transformedData: Record<string, IAircraftTransferData[]> = {
  UnitA: [
    {serial: '11111',
  ORStatus: 'FMC',
  model: 'A',
  unitShortName: 'A',},
  {serial: '22222',
  ORStatus: 'FMC',
  model: 'A',
  unitShortName: 'A',},
  ],
  UnitB: [{serial: '33333',
  ORStatus: 'FMC',
  model: 'B',
  unitShortName: 'B',},
  ],
};

const columns: ColumnConfig<IAircraftTransferData>[] = [
  {
    label: 'Serial Number',
    key: 'serial',
    render: (value: IAircraftTransferData['serial']) => value,
  },
  {
    label: 'Model',
    key: 'model',
    render: (value: IAircraftTransferData['model']) => value,
  },
];

const keyTitleMapping = {
    UnitA: <span>Unit A</span>,
    UnitB: <span>Unit B</span>,
  };

const transferFromParams: AircraftTransferColumnProps = {
  toggleOptions: ['My Unit', 'In Transit', 'External'],
  unitToggleValue : 'In Transit',
  setUnitToggleValue : vi.fn(),
  toggleDisabled : false,
  selectedUnit : transientUnit,
  setSelectedUnit : vi.fn(),
  unitOptions : [],
  selectedSerials : ['11111', '33333'],
  setSelectedSerials : vi.fn(),
  isLoading : false,
  transformedData : transformedData,
  keyTitleMapping : keyTitleMapping,
  columns : columns,
  transferColumnType : 'Transfer From',
}

const transferToParams: AircraftTransferColumnProps = {
  ...transferFromParams,
  toggleOptions: ['Unit', 'In Transit'],
 transferColumnType : 'Transfer To',
}

describe('AircraftTransferColumn Tests', () => {
  const renderWithProvider = (params: AircraftTransferColumnProps) => {
      render(
        <ProviderWrapper>
            <AircraftTransferColumn {...params} />
        </ProviderWrapper>,
      );
  };

  it('should disable toggle buttons', () => {
    renderWithProvider({...transferFromParams, toggleDisabled: true});

    transferFromParams.toggleOptions.forEach((option) => {
      expect(screen.getByLabelText(option)).toBeDisabled();
    });
  });

  it('should have selectedSerials checked in the table and call setSelectedSerials when checkbox is clicked', () => {
    renderWithProvider({...transferFromParams});

    transferFromParams.selectedSerials.forEach((serial) => {
      const checkbox = screen.getByLabelText(`Select serial ${serial}`);
      expect(checkbox).toBeChecked();
    });

    const unselectedSerial = '22222';
    const uncheckedCheckbox = screen.getByLabelText(`Select serial ${unselectedSerial}`);
    expect(uncheckedCheckbox).not.toBeChecked();

    fireEvent.click(uncheckedCheckbox);
    expect(transferFromParams.setSelectedSerials).toHaveBeenCalledTimes(1);
    
    fireEvent.click(uncheckedCheckbox);
    expect(transferFromParams.setSelectedSerials).toHaveBeenCalledTimes(2);
  });

  describe('Transfer From AircraftTransferColumn Tests', () => {
    it('should include main components of column', () => {
      renderWithProvider(transferFromParams);
      expect(screen.getByText('Transfer From')).toBeInTheDocument();
      
      transferFromParams.toggleOptions.forEach((option) => {
        expect(screen.getByLabelText(option)).toBeInTheDocument();
        expect(screen.getByLabelText(option)).toBeEnabled();
      });

      expect(screen.getByTestId('losing-unit-select-text-field')).toBeInTheDocument();
      expect(screen.getByLabelText('Filters open button')).toBeInTheDocument();
      expect(screen.getByLabelText('Filters open button')).toBeEnabled();
      
      expect(screen.getByPlaceholderText('Search aircraft')).toBeInTheDocument();
      expect(screen.getByLabelText('search-bar')).toBeInTheDocument();
      expect(screen.getByTestId('pmx-sectioned-table')).toBeInTheDocument();
      
      expect(screen.queryByText('Transfer To')).not.toBeInTheDocument();
      expect(screen.queryByTestId('gaining-unit-select-text-field')).not.toBeInTheDocument();
      expect(screen.queryByTestId('submit-transfer-button')).not.toBeInTheDocument();

      expect(screen.queryByText('No aircraft for the selected unit')).not.toBeInTheDocument();
    });

    it('should display empty state text if no data in table', () => {
      renderWithProvider({...transferFromParams, transformedData: {}});
      expect(screen.getByText('No aircraft for the selected unit')).toBeInTheDocument();
    });
  });

  describe('Transfer To AircraftTransferColumn Tests', () => {
    it('should include main components of column', () => {
      renderWithProvider(transferToParams);
      expect(screen.getByText('Transfer To')).toBeInTheDocument();

      transferToParams.toggleOptions.forEach((option) => {
        expect(screen.getByLabelText(option)).toBeInTheDocument();
        expect(screen.getByLabelText(option)).toBeEnabled();
      });
      
      expect(screen.getByTestId('gaining-unit-select-text-field')).toBeInTheDocument();
      expect(screen.getByTestId('submit-transfer-button')).toBeInTheDocument();
      expect(screen.getByTestId('submit-transfer-button')).toBeEnabled();
      
      expect(screen.getByPlaceholderText('Search aircraft')).toBeInTheDocument();
      expect(screen.getByLabelText('search-bar')).toBeInTheDocument();
      expect(screen.getByTestId('pmx-sectioned-table')).toBeInTheDocument();
      
      expect(screen.queryByText('Transfer From')).not.toBeInTheDocument();
      expect(screen.queryByTestId('losing-unit-select-text-field')).not.toBeInTheDocument();
      expect(screen.queryByTestId('filter-button')).not.toBeInTheDocument();

      expect(screen.queryByText('Select aircraft from the "Transfer From" column')).not.toBeInTheDocument();
    });

    it('should display empty state text if no data in table', () => {
      renderWithProvider({...transferToParams, transformedData: {}});
      expect(screen.getByText('Select aircraft from the "Transfer From" column')).toBeInTheDocument();
    });

    it('should disable transfer button when data is empty', () => {
      renderWithProvider({...transferToParams, transformedData: {}});
      expect(screen.getByTestId('submit-transfer-button')).toBeDisabled();
    });

    it('should disable transfer button when unit is unselected', () => {
      renderWithProvider({...transferToParams, selectedUnit: undefined});
      expect(screen.getByTestId('submit-transfer-button')).toBeDisabled();
    });
  });
  
});