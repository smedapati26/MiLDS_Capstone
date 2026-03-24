import { useState } from 'react';
import { vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UasSingleEdit from '@features/equipment-manager/uas/UasSingleEdit';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { useGetAutoDsrLocationQuery } from '@store/griffin_api/auto_dsr/slices';
import { IUAS } from '@store/griffin_api/uas/models/IUAS';
import { useAppSelector } from '@store/hooks';

import { ThemedTestingComponent } from '@vitest/helpers';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

const mockSetUpdatedRows = vi.fn();
const mockSetShowSnackbar = vi.fn();

// Mock the mutation hook
const mockEditUac = vi.fn(() => ({
  unwrap: () => Promise.resolve({ success: true, message: 'UAC Updated' }),
}));
const mockEditUav = vi.fn(() => ({
  unwrap: () => Promise.resolve({ success: true, message: 'UAV Updated' }),
}));

vi.mock('@store/griffin_api/uas/slices', () => ({
  useEditUacEquipmentMutation: () => [mockEditUac, { isLoading: false }],
  useEditUavEquipmentMutation: () => [mockEditUav, { isLoading: false }],
}));

vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetAutoDsrLocationQuery: vi.fn(),
}));

const mockLocations = [
  { id: 1, code: 'LOC1', name: 'Location 1' },
  { id: 2, code: 'LOC2', name: 'Location 2' },
  { id: 3, code: 'LOC3', name: 'Location 3' },
];

// Minimal mock data
const mockUas: IUAS = {
  id: 1,
  locationCode: 'LOC1',
  locationName: 'Location 1',
  serialNumber: 'SN123',
  model: 'ModelX',
  status: 'FMC',
  displayStatus: OperationalReadinessStatusEnum.FMC,
  rtl: 'RTL',
  currentUnit: 'Unit1',
  shortName: 'Short1',
  totalAirframeHours: 100,
  flightHours: 50,
  remarks: 'Initial remarks',
  dateDown: '2024-01-01',
  dateDownCount: 5,
  ecd: '2024-02-01',
  lastSyncTime: '2024-01-01T00:00:00Z',
  lastUpdateTime: '2024-01-01T00:00:00Z',
  shouldSync: true,
  fieldSyncStatus: {
    rtl: true,
    status: true,
    dateDown: true,
    ecd: true,
    flightHours: true,
    remarks: true,
    location: true,
  },
  locationId: 1,
};

describe('UasSingleEdit', () => {
  beforeEach(() => {
    mockEditUac.mockReset();
    mockEditUav.mockReset();
    mockSetUpdatedRows.mockReset();
    mockSetShowSnackbar.mockReset();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');
    (useGetAutoDsrLocationQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { items: mockLocations, count: 3 },
      isLoading: false,
    });
  });

  it('renders and allows editing and saving for UAV', async () => {
    const TestWrapper = () => {
      const [open, setOpen] = useState(true);
      return (
        <ThemedTestingComponent>
          <UasSingleEdit
            open={open}
            setOpen={setOpen}
            data={mockUas}
            setUpdatedRows={mockSetUpdatedRows}
            setShowSnackbar={mockSetShowSnackbar}
            uasType="Uav"
          />
        </ThemedTestingComponent>
      );
    };

    render(<TestWrapper />);

    // Modal should be open
    expect(screen.getByTestId('uas-single-edit')).toBeInTheDocument();

    // Verify OR Status dropdown is present
    const orStatusSelect = screen.getByTestId('uas-or-status-select');
    expect(orStatusSelect).toBeInTheDocument();

    // Verify remarks field exists
    const remarksInput = screen.getByTestId('uas-single-edit-remarks');
    expect(remarksInput).toBeInTheDocument();

    // Click Save
    const saveButton = screen.getByTestId('uas-single-edit-save-button');
    fireEvent.click(saveButton);

    // Wait for mutation to be called
    await waitFor(() => {
      expect(mockEditUav).toHaveBeenCalled();
    });

    // Modal should close and snackbar should show
    await waitFor(() => {
      expect(mockSetUpdatedRows).toHaveBeenCalledWith([mockUas.serialNumber]);
      expect(mockSetShowSnackbar).toHaveBeenCalledWith(true);
    });
  });

  it('renders and allows editing and saving for UAC', async () => {
    const TestWrapper = () => {
      const [open, setOpen] = useState(true);
      return (
        <ThemedTestingComponent>
          <UasSingleEdit
            open={open}
            setOpen={setOpen}
            data={mockUas}
            setUpdatedRows={mockSetUpdatedRows}
            setShowSnackbar={mockSetShowSnackbar}
            uasType="Uac"
          />
        </ThemedTestingComponent>
      );
    };

    render(<TestWrapper />);

    // Modal should be open
    expect(screen.getByTestId('uas-single-edit')).toBeInTheDocument();

    // Verify OR Status dropdown is present
    const orStatusSelect = screen.getByTestId('uas-or-status-select');
    expect(orStatusSelect).toBeInTheDocument();

    // Verify remarks field exists
    const remarksInput = screen.getByTestId('uas-single-edit-remarks');
    expect(remarksInput).toBeInTheDocument();

    // Click Save
    const saveButton = screen.getByTestId('uas-single-edit-save-button');
    fireEvent.click(saveButton);

    // Wait for mutation to be called
    await waitFor(() => {
      expect(mockEditUac).toHaveBeenCalled();
    });

    // Modal should close and snackbar should show
    await waitFor(() => {
      expect(mockSetUpdatedRows).toHaveBeenCalledWith([mockUas.serialNumber]);
      expect(mockSetShowSnackbar).toHaveBeenCalledWith(true);
    });
  });

  it('closes when Cancel is clicked', async () => {
    const TestWrapper = () => {
      const [open, setOpen] = useState(true);
      return (
        <ThemedTestingComponent>
          <UasSingleEdit
            open={open}
            setOpen={setOpen}
            data={mockUas}
            setUpdatedRows={mockSetUpdatedRows}
            setShowSnackbar={mockSetShowSnackbar}
            uasType="Uav"
          />
        </ThemedTestingComponent>
      );
    };

    render(<TestWrapper />);

    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);
  });

  it('closes when Close button is clicked', async () => {
    const TestWrapper = () => {
      const [open, setOpen] = useState(true);
      return (
        <ThemedTestingComponent>
          <UasSingleEdit
            open={open}
            setOpen={setOpen}
            data={mockUas}
            setUpdatedRows={mockSetUpdatedRows}
            setShowSnackbar={mockSetShowSnackbar}
            uasType="Uav"
          />
        </ThemedTestingComponent>
      );
    };

    render(<TestWrapper />);
    const closeButton = screen.getByTestId('close-button');
    await userEvent.click(closeButton);
  });
});