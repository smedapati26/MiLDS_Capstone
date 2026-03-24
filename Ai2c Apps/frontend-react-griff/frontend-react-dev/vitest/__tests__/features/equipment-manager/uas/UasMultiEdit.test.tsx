/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ColumnConfig } from '@components/data-tables';
import { MultiStepProvider, UasEditStepsEnum } from '@features/equipment-manager/uas/UasEditSteps';
import UasMultiEdit from '@features/equipment-manager/uas/UasMultiEdit';

import { IUAS } from '@store/griffin_api/uas/models/IUAS';

// Mock the mutations with proper unwrap method
const mockEditUav = vi.fn(() => ({
  unwrap: vi.fn().mockResolvedValue({ success: true }),
}));

const mockEditUac = vi.fn(() => ({
  unwrap: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@store/griffin_api/uas/slices', () => ({
  useEditUavEquipmentMutation: () => [mockEditUav],
  useEditUacEquipmentMutation: () => [mockEditUac],
}));

// Mock the step components
vi.mock('@features/equipment-manager/uas/UasEditSteps', async () => {
  const actual = await vi.importActual('@features/equipment-manager/uas/UasEditSteps');
  return {
    ...actual,
    SelectFieldsStep: ({ steps, setSteps }: any) => (
      <div data-testid="select-fields-step">
        Select Fields Step
        <button onClick={() => setSteps([...steps, UasEditStepsEnum.STATUS])}>Add Status Step</button>
      </div>
    ),
    StatusStep: () => <div data-testid="status-step">Status Step</div>,
    FlightHourStep: () => <div data-testid="flight-hour-step">Flight Hour Step</div>,
    LocationStep: () => <div data-testid="location-step">Location Step</div>,
    RemarkStep: () => <div data-testid="remark-step">Remark Step</div>,
    ReviewStep: () => <div data-testid="review-step">Review Step</div>,
  };
});

// Mock PmxTable
vi.mock('@components/data-tables/PmxTable', () => ({
  default: ({ rows, columns }: any) => (
    <div data-testid="pmx-table">
      <div data-testid="table-rows">{rows.length}</div>
      <div data-testid="table-columns">{columns.length}</div>
    </div>
  ),
}));

const mockColumns: ColumnConfig<IUAS>[] = [
  {
    key: 'serialNumber',
    label: 'SN',
    render: (value: any) => value,
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: any) => value,
  },
  {
    key: 'rtl',
    label: 'RTL',
    render: (value: any) => value,
  },
  {
    key: 'serialNumber', // Use a valid key instead of 'actions'
    label: 'Actions',
    render: () => <button>Edit</button>,
  },
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
    remarks: 'Remark 1',
    dateDown: '2024-01-01',
    dateDownCount: 0,
    ecd: '2024-01-01',
    lastSyncTime: '2024-01-01',
    lastUpdateTime: '2024-01-01',
    shouldSync: false,
    fieldSyncStatus: { rtl: true, status: true },
    locationCode: 'LOC1',
    locationId: 1,
    locationName: 'Location 1',
  },
];

describe('UasMultiEdit', () => {
  const mockSetOpen = vi.fn();
  const mockSetUpdatedRows = vi.fn();
  const mockSetShowSnackbar = vi.fn();

  const defaultProps = {
    open: true,
    setOpen: mockSetOpen,
    setUpdatedRows: mockSetUpdatedRows,
    setShowSnackbar: mockSetShowSnackbar,
    editUasType: 'Uav' as const,
    editTitle: <div>Edit Title</div>,
    columns: mockColumns,
    rows: mockRows,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditUav.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true }),
    });
    mockEditUac.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true }),
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <MultiStepProvider>
        <UasMultiEdit {...defaultProps} {...props} />
      </MultiStepProvider>,
    );
  };

  describe('Rendering', () => {
    it('should render modal when open is true', () => {
      renderComponent();

      expect(screen.getByTestId('uas-multi-edit-modal')).toBeInTheDocument();
    });

    it('should not render modal when open is false', () => {
      renderComponent({ open: false });

      expect(screen.queryByTestId('uas-multi-edit-modal')).not.toBeInTheDocument();
    });

    it('should render title for UAV', () => {
      renderComponent({ editUasType: 'Uav' });

      expect(screen.getByText('Edit UAV')).toBeInTheDocument();
    });

    it('should render title for UAC', () => {
      renderComponent({ editUasType: 'Uac' });

      expect(screen.getByText('Edit Components')).toBeInTheDocument();
    });

    it('should render edit title', () => {
      renderComponent();

      expect(screen.getByText('Edit Title')).toBeInTheDocument();
    });

    it('should render close button', () => {
      renderComponent();

      expect(screen.getByTestId('close-multi-edit')).toBeInTheDocument();
    });

    it('should render PmxTable', () => {
      renderComponent();

      expect(screen.getByTestId('pmx-table')).toBeInTheDocument();
    });

    it('should render table with correct number of rows', () => {
      renderComponent();

      expect(screen.getByTestId('table-rows')).toHaveTextContent('1');
    });

    it('should render table without actions column', () => {
      renderComponent();

      expect(screen.getByTestId('table-columns')).toHaveTextContent('3');
    });

    it('should render stepper', () => {
      renderComponent();

      const stepper = document.querySelector('.MuiStepper-root');
      expect(stepper).toBeInTheDocument();
    });

    it('should render Cancel button', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('should render Next button initially', () => {
      renderComponent();

      expect(screen.getByTestId('multi-edit-next')).toHaveTextContent('Next');
    });
  });

  describe('Initial Step', () => {
    it('should render SelectFieldsStep initially', () => {
      renderComponent();

      expect(screen.getByTestId('select-fields-step')).toBeInTheDocument();
    });

    it('should have SELECT and REVIEW steps by default', () => {
      renderComponent();

      const steps = document.querySelectorAll('.MuiStep-root');
      expect(steps).toHaveLength(2);
    });
  });

  describe('Close Functionality', () => {
    it('should call setOpen when close button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const closeButton = screen.getByTestId('close-multi-edit');

      await user.click(closeButton);

      await waitFor(() => {
        expect(mockSetOpen).toHaveBeenCalledWith(false);
      });
    });

    it('should call setOpen when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockSetOpen).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Step Navigation', () => {
    it('should show Next button on non-review steps', () => {
      renderComponent();

      expect(screen.getByTestId('multi-edit-next')).toHaveTextContent('Next');
    });

    it('should navigate to next step when Next is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      // Initially on SELECT step, clicking Next should go to REVIEW (since no steps added)
      const nextButton = screen.getByTestId('multi-edit-next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-step')).toBeInTheDocument();
      });
    });

    it('should navigate through added steps', async () => {
      const user = userEvent.setup();
      renderComponent();

      // Add a status step
      const addStepButton = screen.getByText('Add Status Step');
      await user.click(addStepButton);

      // Now steps should be [SELECT, REVIEW, STATUS]
      // Click Next from SELECT
      const nextButton = screen.getByTestId('multi-edit-next');
      await user.click(nextButton);

      // Should go to REVIEW (index 1)
      await waitFor(() => {
        expect(screen.getByTestId('review-step')).toBeInTheDocument();
      });
    });
  });

  describe('Save Functionality', () => {
    it('should show Save button on review step', async () => {
      const user = userEvent.setup();
      renderComponent();

      const nextButton = screen.getByTestId('multi-edit-next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('multi-edit-next')).toHaveTextContent('Save');
      });
    });

    it('should disable Save button when no steps are selected', async () => {
      const user = userEvent.setup();
      renderComponent();

      const nextButton = screen.getByTestId('multi-edit-next');
      await user.click(nextButton);

      await waitFor(() => {
        const saveButton = screen.getByTestId('multi-edit-next');
        expect(saveButton).toBeDisabled();
      });
    });

    it('should call editUav mutation for UAV type', async () => {
      const user = userEvent.setup();
      renderComponent({ editUasType: 'Uav' });

      const addStepButton = screen.getByText('Add Status Step');
      await user.click(addStepButton);

      const nextButton = screen.getByTestId('multi-edit-next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-step')).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('multi-edit-next');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockEditUav).toHaveBeenCalled();
      });
    });

    it('should call editUac mutation for UAC type', async () => {
      const user = userEvent.setup();
      renderComponent({ editUasType: 'Uac' });

      const addStepButton = screen.getByText('Add Status Step');
      await user.click(addStepButton);

      const nextButton = screen.getByTestId('multi-edit-next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-step')).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('multi-edit-next');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockEditUac).toHaveBeenCalled();
      });
    });

    it('should call setUpdatedRows on successful save', async () => {
      const user = userEvent.setup();
      renderComponent();

      const addStepButton = screen.getByText('Add Status Step');
      await user.click(addStepButton);

      const nextButton = screen.getByTestId('multi-edit-next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-step')).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('multi-edit-next');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockSetUpdatedRows).toHaveBeenCalled();
      });
    });

    it('should call setShowSnackbar on successful save', async () => {
      const user = userEvent.setup();
      renderComponent();

      const addStepButton = screen.getByText('Add Status Step');
      await user.click(addStepButton);

      const nextButton = screen.getByTestId('multi-edit-next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-step')).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('multi-edit-next');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockSetShowSnackbar).toHaveBeenCalledWith(true);
      });
    });

    it('should close modal on successful save', async () => {
      const user = userEvent.setup();
      renderComponent();

      const addStepButton = screen.getByText('Add Status Step');
      await user.click(addStepButton);

      const nextButton = screen.getByTestId('multi-edit-next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-step')).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('multi-edit-next');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockSetOpen).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error snackbar on save failure', async () => {
      const user = userEvent.setup();
      mockEditUav.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue(new Error('Save failed')),
      });

      renderComponent();

      const addStepButton = screen.getByText('Add Status Step');
      await user.click(addStepButton);

      const nextButton = screen.getByTestId('multi-edit-next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-step')).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('multi-edit-next');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to update UAVs/i)).toBeInTheDocument();
      });
    });

    it('should not close modal on save failure', async () => {
      const user = userEvent.setup();
      mockEditUav.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue(new Error('Save failed')),
      });

      renderComponent();

      const addStepButton = screen.getByText('Add Status Step');
      await user.click(addStepButton);

      const nextButton = screen.getByTestId('multi-edit-next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-step')).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('multi-edit-next');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to update UAVs/i)).toBeInTheDocument();
      });

      expect(screen.getByTestId('uas-multi-edit-modal')).toBeInTheDocument();
    });
  });

  describe('Multiple Rows', () => {
    it('should handle multiple rows', () => {
      const multipleRows = [...mockRows, { ...mockRows[0], id: 2, serialNumber: 'SN002' }];

      renderComponent({ rows: multipleRows });

      expect(screen.getByTestId('table-rows')).toHaveTextContent('2');
    });

    it('should call mutation for each row', async () => {
      const user = userEvent.setup();
      const multipleRows = [...mockRows, { ...mockRows[0], id: 2, serialNumber: 'SN002' }];

      renderComponent({ rows: multipleRows });

      const addStepButton = screen.getByText('Add Status Step');
      await user.click(addStepButton);

      const nextButton = screen.getByTestId('multi-edit-next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-step')).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('multi-edit-next');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockEditUav).toHaveBeenCalledTimes(2);
      });
    });
  });
});
