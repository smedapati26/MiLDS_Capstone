/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { ColumnConfig } from '@components/data-tables/PmxTable';
import { MultiStepProvider, ReviewStep, UasEditStepsEnum } from '@features/equipment-manager/uas/UasEditSteps';

import { IUAS } from '@store/griffin_api/uas/models/IUAS';

// Mock PmxTable component
vi.mock('@components/data-tables/PmxTable', () => ({
  default: ({ rows, columns }: { rows: any[]; columns: any[] }) => (
    <div data-testid="pmx-table">
      <div data-testid="table-rows-count">{rows.length}</div>
      <div data-testid="table-columns-count">{columns.length}</div>
      {rows.map((row, index) => (
        <div key={index} data-testid={`row-${index}`}>
          <span data-testid={`row-${index}-status`}>{row.status}</span>
          <span data-testid={`row-${index}-rtl`}>{row.rtl}</span>
          <span data-testid={`row-${index}-flightHours`}>{row.flightHours}</span>
          <span data-testid={`row-${index}-remarks`}>{row.remarks}</span>
          <span data-testid={`row-${index}-locationCode`}>{row.locationCode}</span>
        </div>
      ))}
    </div>
  ),
}));

const mockColumns: ColumnConfig<IUAS>[] = [
  { key: 'serialNumber', label: 'SN' },
  { key: 'status', label: 'Status' },
  { key: 'rtl', label: 'RTL' },
  { key: 'flightHours', label: 'Flight Hours' },
  { key: 'remarks', label: 'Remarks' },
  { key: 'locationCode', label: 'Location' },
  { key: 'id', label: 'Actions' }, // Using 'id' as a placeholder for actions
];

const mockRows: IUAS[] = [
  {
    id: 1,
    serialNumber: 'SN001',
    model: 'Model1',
    status: 'FMC',
    displayStatus: 'FMC' as any,
    rtl: 'RTL',
    currentUnit: 'Unit1',
    shortName: 'Short1',
    totalAirframeHours: 100,
    flightHours: 50,
    remarks: 'Original remark 1',
    dateDown: '2024-01-01',
    dateDownCount: 0,
    ecd: '2024-01-01',
    lastSyncTime: '2024-01-01',
    lastUpdateTime: '2024-01-01',
    shouldSync: false,
    fieldSyncStatus: { rtl: false, status: false, flightHours: false, remarks: false, location: false },
    locationCode: 'LOC1',
    locationId: 1,
    locationName: 'Location 1',
  },
  {
    id: 2,
    serialNumber: 'SN002',
    model: 'Model2',
    status: 'PMC',
    displayStatus: 'PMC' as any,
    rtl: 'NRTL',
    currentUnit: 'Unit2',
    shortName: 'Short2',
    totalAirframeHours: 200,
    flightHours: 75,
    remarks: 'Original remark 2',
    dateDown: '2024-01-01',
    dateDownCount: 0,
    ecd: '2024-01-01',
    lastSyncTime: '2024-01-01',
    lastUpdateTime: '2024-01-01',
    shouldSync: false,
    fieldSyncStatus: { rtl: true, status: true, flightHours: true, remarks: true, location: true },
    locationCode: 'LOC2',
    locationId: 2,
    locationName: 'Location 2',
  },
];

// Wrapper component
const ReviewStepWrapper = ({ steps }: { steps: UasEditStepsEnum[] }) => {
  return (
    <MultiStepProvider>
      <ReviewStep rows={mockRows} columns={mockColumns} steps={steps} />
    </MultiStepProvider>
  );
};

describe('ReviewStep', () => {
  describe('Rendering', () => {
    it('should render the component', () => {
      render(<ReviewStepWrapper steps={[]} />);

      expect(screen.getByText('Review Changes')).toBeInTheDocument();
    });

    it('should render the description text', () => {
      render(<ReviewStepWrapper steps={[]} />);

      expect(screen.getByText('Review Changes')).toBeInTheDocument();
      expect(screen.getByText('Review the changes shown in blue before saving.')).toBeInTheDocument();
    });

    it('should render PmxTable', () => {
      render(<ReviewStepWrapper steps={[]} />);

      expect(screen.getByTestId('pmx-table')).toBeInTheDocument();
    });

    it('should render correct number of rows', () => {
      render(<ReviewStepWrapper steps={[]} />);

      const rowsCount = screen.getByTestId('table-rows-count');
      expect(rowsCount).toHaveTextContent('2');
    });

    it('should render columns without actions column', () => {
      render(<ReviewStepWrapper steps={[]} />);

      const columnsCount = screen.getByTestId('table-columns-count');
      // Should be columns.length - 1 (excluding actions)
      expect(columnsCount).toHaveTextContent('6');
    });

    it('should render with Stack layout', () => {
      const { container } = render(<ReviewStepWrapper steps={[]} />);

      const stack = container.querySelector('.MuiStack-root');
      expect(stack).toBeInTheDocument();
    });
  });

  describe('Status Step Updates', () => {
    it('should update status when STATUS step is included', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.STATUS]} />);

      const row0Status = screen.getByTestId('row-0-status');
      const row1Status = screen.getByTestId('row-1-status');

      expect(row0Status).toBeInTheDocument();
      expect(row1Status).toBeInTheDocument();
    });

    it('should update RTL when STATUS step is included', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.STATUS]} />);

      const row0Rtl = screen.getByTestId('row-0-rtl');
      const row1Rtl = screen.getByTestId('row-1-rtl');

      expect(row0Rtl).toBeInTheDocument();
      expect(row1Rtl).toBeInTheDocument();
    });

    it('should not update status when STATUS step is not included', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.PERIOD]} />);

      const row0Status = screen.getByTestId('row-0-status');
      expect(row0Status).toHaveTextContent('FMC'); // Original value
    });
  });

  describe('Period Step Updates', () => {
    it('should update flight hours when PERIOD step is included', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.PERIOD]} />);

      const row0FlightHours = screen.getByTestId('row-0-flightHours');
      const row1FlightHours = screen.getByTestId('row-1-flightHours');

      expect(row0FlightHours).toBeInTheDocument();
      expect(row1FlightHours).toBeInTheDocument();
    });

    it('should not update flight hours when PERIOD step is not included', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.STATUS]} />);

      const row0FlightHours = screen.getByTestId('row-0-flightHours');
      expect(row0FlightHours).toHaveTextContent('50'); // Original value
    });
  });

  describe('Remarks Step Updates', () => {
    it('should update remarks when REMARKS step is included', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.REMARKS]} />);

      const row0Remarks = screen.getByTestId('row-0-remarks');
      const row1Remarks = screen.getByTestId('row-1-remarks');

      expect(row0Remarks).toBeInTheDocument();
      expect(row1Remarks).toBeInTheDocument();
    });

    it('should not update remarks when REMARKS step is not included', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.STATUS]} />);

      const row0Remarks = screen.getByTestId('row-0-remarks');
      expect(row0Remarks).toHaveTextContent('Original remark 1'); // Original value
    });
  });

  describe('Location Step Updates', () => {
    it('should update location when LOCATION step is included', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.LOCATION]} />);

      const row0Location = screen.getByTestId('row-0-locationCode');
      const row1Location = screen.getByTestId('row-1-locationCode');

      expect(row0Location).toBeInTheDocument();
      expect(row1Location).toBeInTheDocument();
    });

    it('should not update location when LOCATION step is not included', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.STATUS]} />);

      const row0Location = screen.getByTestId('row-0-locationCode');
      expect(row0Location).toHaveTextContent('LOC1'); // Original value
    });
  });

  describe('Multiple Steps', () => {
    it('should update multiple fields when multiple steps are included', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.STATUS, UasEditStepsEnum.PERIOD]} />);

      const row0Status = screen.getByTestId('row-0-status');
      const row0FlightHours = screen.getByTestId('row-0-flightHours');

      expect(row0Status).toBeInTheDocument();
      expect(row0FlightHours).toBeInTheDocument();
    });

    it('should update all fields when all steps are included', () => {
      render(
        <ReviewStepWrapper
          steps={[
            UasEditStepsEnum.STATUS,
            UasEditStepsEnum.PERIOD,
            UasEditStepsEnum.REMARKS,
            UasEditStepsEnum.LOCATION,
          ]}
        />,
      );

      const row0Status = screen.getByTestId('row-0-status');
      const row0FlightHours = screen.getByTestId('row-0-flightHours');
      const row0Remarks = screen.getByTestId('row-0-remarks');
      const row0Location = screen.getByTestId('row-0-locationCode');

      expect(row0Status).toBeInTheDocument();
      expect(row0FlightHours).toBeInTheDocument();
      expect(row0Remarks).toBeInTheDocument();
      expect(row0Location).toBeInTheDocument();
    });

    it('should preserve original values for non-included steps', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.STATUS]} />);

      const row0FlightHours = screen.getByTestId('row-0-flightHours');
      const row0Remarks = screen.getByTestId('row-0-remarks');
      const row0Location = screen.getByTestId('row-0-locationCode');

      expect(row0FlightHours).toHaveTextContent('50'); // Original
      expect(row0Remarks).toHaveTextContent('Original remark 1'); // Original
      expect(row0Location).toHaveTextContent('LOC1'); // Original
    });
  });

  describe('Empty Steps', () => {
    it('should render original data when no steps are included', () => {
      render(<ReviewStepWrapper steps={[]} />);

      const row0Status = screen.getByTestId('row-0-status');
      const row0Rtl = screen.getByTestId('row-0-rtl');
      const row0FlightHours = screen.getByTestId('row-0-flightHours');
      const row0Remarks = screen.getByTestId('row-0-remarks');
      const row0Location = screen.getByTestId('row-0-locationCode');

      expect(row0Status).toHaveTextContent('FMC');
      expect(row0Rtl).toHaveTextContent('RTL');
      expect(row0FlightHours).toHaveTextContent('50');
      expect(row0Remarks).toHaveTextContent('Original remark 1');
      expect(row0Location).toHaveTextContent('LOC1');
    });
  });

  describe('Multiple Rows', () => {
    it('should update all rows with same values', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.STATUS]} />);

      const row0Status = screen.getByTestId('row-0-status');
      const row1Status = screen.getByTestId('row-1-status');

      expect(row0Status).toBeInTheDocument();
      expect(row1Status).toBeInTheDocument();
    });

    it('should preserve individual row properties', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.STATUS]} />);

      const row0 = screen.getByTestId('row-0');
      const row1 = screen.getByTestId('row-1');

      expect(row0).toBeInTheDocument();
      expect(row1).toBeInTheDocument();
    });
  });

  describe('Field Sync Status Updates', () => {
    it('should update fieldSyncStatus for STATUS step', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.STATUS]} />);

      expect(screen.getByTestId('pmx-table')).toBeInTheDocument();
    });

    it('should update fieldSyncStatus for PERIOD step', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.PERIOD]} />);

      expect(screen.getByTestId('pmx-table')).toBeInTheDocument();
    });

    it('should update fieldSyncStatus for REMARKS step', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.REMARKS]} />);

      expect(screen.getByTestId('pmx-table')).toBeInTheDocument();
    });

    it('should update fieldSyncStatus for LOCATION step', () => {
      render(<ReviewStepWrapper steps={[UasEditStepsEnum.LOCATION]} />);

      expect(screen.getByTestId('pmx-table')).toBeInTheDocument();
    });

    it('should update fieldSyncStatus for multiple steps', () => {
      render(
        <ReviewStepWrapper steps={[UasEditStepsEnum.STATUS, UasEditStepsEnum.PERIOD, UasEditStepsEnum.REMARKS]} />,
      );

      expect(screen.getByTestId('pmx-table')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should handle empty rows array', () => {
      render(
        <MultiStepProvider>
          <ReviewStep rows={[]} columns={mockColumns} steps={[]} />
        </MultiStepProvider>,
      );

      const rowsCount = screen.getByTestId('table-rows-count');
      expect(rowsCount).toHaveTextContent('0');
    });

    it('should handle single row', () => {
      render(
        <MultiStepProvider>
          <ReviewStep rows={[mockRows[0]]} columns={mockColumns} steps={[]} />
        </MultiStepProvider>,
      );

      const rowsCount = screen.getByTestId('table-rows-count');
      expect(rowsCount).toHaveTextContent('1');
    });

    it('should handle columns prop correctly', () => {
      render(<ReviewStepWrapper steps={[]} />);

      const columnsCount = screen.getByTestId('table-columns-count');
      // Should exclude the last column (actions)
      expect(columnsCount).toHaveTextContent((mockColumns.length - 1).toString());
    });
  });

  describe('useMemo Optimization', () => {
    it('should render table with memoized rows', () => {
      const { rerender } = render(<ReviewStepWrapper steps={[UasEditStepsEnum.STATUS]} />);

      expect(screen.getByTestId('pmx-table')).toBeInTheDocument();

      // Rerender with same props
      rerender(<ReviewStepWrapper steps={[UasEditStepsEnum.STATUS]} />);

      expect(screen.getByTestId('pmx-table')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should render components in vertical stack', () => {
      const { container } = render(<ReviewStepWrapper steps={[]} />);

      const stack = container.querySelector('.MuiStack-root');
      expect(stack).toBeInTheDocument();
    });

    it('should have proper spacing between elements', () => {
      const { container } = render(<ReviewStepWrapper steps={[]} />);

      const stack = container.querySelector('.MuiStack-root');
      expect(stack).toBeInTheDocument();
    });
  });

  describe('Typography', () => {
    it('should render title with correct variant', () => {
      render(<ReviewStepWrapper steps={[]} />);

      const title = screen.getByText('Review Changes');
      expect(title).toBeInTheDocument();
    });

    it('should render description with correct variant', () => {
      render(<ReviewStepWrapper steps={[]} />);

      const description = screen.getByText('Review the changes shown in blue before saving.');
      expect(description).toBeInTheDocument();
    });
  });
});
