// src/tests/MultiEditModal.test.tsx
import { describe, expect, it } from 'vitest';
import { ProviderWrapper } from 'vitest/helpers';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Echelon } from '@ai2c/pmx-mui';

import { ColumnConfig } from '@components/data-tables';
import AircraftTransferReviewModal from '@features/equipment-transfer/Transfer/Aircraft/AircraftTransferReviewModal';

import { IAircraftTransferData } from '@store/griffin_api/aircraft/models';
import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';

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

const keyTitleMapping: Record<string, string> = {
  UnitA: "Unit A, Formatted",
  UnitB: "Unit B, Formatted",
};

const mockLosingUnit: IUnitBrief = {
  uic: 'BAT_A',
  echelon: Echelon.BATTALION,
  component: '',
  level: 1,
  displayName: 'BATTALION A',
  shortName: 'BAT A',
}

const mockGainingUnit: IUnitBrief = {
  uic: 'UNIT_C',
  echelon: Echelon.SQUAD,
  component: '',
  level: 3,
  displayName: 'SQUAD UNIT C',
  shortName: 'UNIT C',
}

const mockSetOpen = vi.fn();
const mockHandleSubmit = vi.fn();

describe('AircraftTransferReviewModal Tests', () => {
  const renderWithProvider = (open: boolean = true) => {
      render(
        <ProviderWrapper>
          <AircraftTransferReviewModal 
            losingUnit={mockLosingUnit} 
            gainingUnit={mockGainingUnit} 
            open={open} 
            setOpen={mockSetOpen}
            handleSubmit={mockHandleSubmit}
            transformedData={transformedData} 
            keyTitleMapping={keyTitleMapping} 
            columns={columns} 
          />
        </ProviderWrapper>,
      );
  };

  it('should not display modal if closed', () => {
    renderWithProvider(false);
    
    expect(screen.queryByText('Transfer Aircraft')).not.toBeInTheDocument();
    expect(screen.queryByTestId('aircraft-transfer-cancel-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('aircraft-transfer-submit-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('aircraft-transfer-close-btn')).not.toBeInTheDocument();
  });

  it('should include review modal title and buttons', () => {
    renderWithProvider();

    expect(screen.getByText('Transfer Aircraft')).toBeInTheDocument();
    expect(screen.getByTestId('aircraft-transfer-cancel-btn')).toBeInTheDocument();
    expect(screen.getByTestId('aircraft-transfer-submit-btn')).toBeInTheDocument();
    expect(screen.getByTestId('aircraft-transfer-close-btn')).toBeInTheDocument();
  });

  it('should include data from transformed data', () => {
    renderWithProvider();

    // Card Sections for each Unit
    expect(screen.getAllByText("Transfer From:")).toHaveLength(Object.keys(transformedData).length);
    expect(screen.getAllByText("Transfer To:")).toHaveLength(Object.keys(transformedData).length);
    expect(screen.getAllByText(mockGainingUnit.displayName)).toHaveLength(Object.keys(transformedData).length);

    // Table column headers
    columns.forEach((column) => {
      expect(screen.getAllByText(column.label)).toHaveLength(Object.keys(transformedData).length);
    })

    // Aircraft serial numbers from table and table header
    Object.entries(transformedData).map(([key, rows]) => {
      expect(screen.getByText(keyTitleMapping[key])).toBeInTheDocument();

      rows.forEach((aircraft) => {
        expect(screen.getByText(aircraft.serial)).toBeInTheDocument();
      })
    });
  });

  it('should call handle cancel mock when close button clicked', async () => {
    renderWithProvider();

    const closeButton = screen.getByTestId('aircraft-transfer-close-btn');
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    await waitFor( () => {
      expect(mockHandleSubmit).not.toHaveBeenCalled();
      expect(mockSetOpen).toHaveBeenCalled();
    });
  });

  it('should call handle cancel mock when cancel button clicked', async () => {
    renderWithProvider();

    const cancelButton = screen.getByTestId('aircraft-transfer-cancel-btn');
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);
    await waitFor( () => {
      expect(mockHandleSubmit).not.toHaveBeenCalled();
      expect(mockSetOpen).toHaveBeenCalled();
    });
  });

  it('should call handle close and submit mocks when submit button clicked', async () => {
    renderWithProvider();

    const submitButton = screen.getByTestId('aircraft-transfer-submit-btn');
    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);
    await waitFor( () => {
      expect(mockSetOpen).toHaveBeenCalled();
      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });
});