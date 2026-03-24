import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AircraftSingleEdit from '@features/equipment-manager/aircraft/AircraftSingleEdit';

import { IAircraftEquipmentDetails } from '@store/griffin_api/aircraft/models';
import { useGetAutoDsrLocationQuery } from '@store/griffin_api/auto_dsr/slices';
import { useAppSelector } from '@store/hooks';

import { ThemedTestingComponent } from '@vitest/helpers';

const mockSetUpdatedRows = vi.fn();
const mockSetShowSnackbar = vi.fn();

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

const mockEdiAircraftEquipmentDetails = vi.fn(() => ({
  unwrap: () =>
    Promise.resolve({
      editedAircraft: ['12345'],
      notEditedAircraft: [],
      detail: 'string',
    }),
}));

vi.mock('@store/griffin_api/aircraft/slices', () => ({
  useEditAircraftEquipmentDetailsMutation: () => [
    mockEdiAircraftEquipmentDetails, // mock mutation
    { isLoading: false }, // mock state object
  ],
}));

vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetAutoDsrLocationQuery: vi.fn(),
}));

const mockLocations = [
  { id: 1, code: 'LOC1', name: 'Location 1' },
  { id: 2, code: 'LOC2', name: 'Location 2' },
  { id: 3, code: 'LOC3', name: 'Location 3' },
];

const mockData: IAircraftEquipmentDetails = {
  models: [
    {
      model: 'Test Model',
      aircraft: [
        {
          serial: '12345',
          rtl: 'RTL',
          ORStatus: 'FMC',
          totalAirframeHours: 100,
          flightHours: 10,
          location: { id: 1, code: 'LOC1', name: 'Location 1' },
          remarks: 'Initial remarks',
          ecd: null,
          fieldSyncStatus: {
            rtl: true,
            status: true,
            total_airframe_hours: true,
            flight_hours: true,
            remarks: true,
            location: true,
          },
          modifications: [
            { id: 1, modType: 'Mod 1', value: 'test' },
            { id: 2, modType: 'Mod 2', value: 'test2' },
          ],
          status: 'FMC',
          hoursToPhase: 0,
          inPhase: false,
          events: [],
          dateDown: null,
          dateDownCount: null,
        },
      ],
    },
  ],
  unitShortName: 'Test Unit',
  unitUic: 'TEST001',
};

describe('AircraftSingleEdit', () => {
  beforeEach(() => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');
    (useGetAutoDsrLocationQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { items: mockLocations, count: 3 },
      isLoading: false,
    });

    const TestWrapper = () => {
      const [open, setOpen] = useState(true);

      return (
        <ThemedTestingComponent>
          <AircraftSingleEdit
            open={open}
            setOpen={setOpen}
            data={mockData}
            setUpdatedRows={mockSetUpdatedRows}
            setShowSnackbar={mockSetShowSnackbar}
          />
        </ThemedTestingComponent>
      );
    };

    render(<TestWrapper />);
  });

  it('test it rendered with initial values', () => {
    expect(screen.getByTestId('aircraft-single-edit-paper')).toBeInTheDocument();
    expect(screen.getByText('Initial remarks')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument(); // Total flight hours
    expect(screen.getByDisplayValue('10')).toBeInTheDocument(); // Monthly flight hours
    expect(screen.getByTestId('location-paginated-dropdown')).toBeInTheDocument();
    expect(screen.getByText('Modification and Kits')).toBeInTheDocument();
    expect(screen.getAllByTestId('custom-row').length).toEqual(8);
  });

  it('handle close', () => {
    const button = screen.getByTestId('close-button');
    fireEvent.click(button);

    expect(screen.queryByTestId('agse-single-edit-paper')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should update RTL status when a toggle button is clicked', () => {
    const nrtlButton = screen.getByText('NRTL');
    fireEvent.click(nrtlButton);

    expect(nrtlButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should update ORStatus when a dropdown option is selected', async () => {
    // Find the select dropdown by test id
    const select = screen.getByTestId('or-status-select');

    // Click to open the dropdown
    const button = within(select).getByRole('combobox');
    fireEvent.mouseDown(button);

    // Wait for the dropdown menu to appear and find PMCM option
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });

    // Find and click the PMCM option
    const pmcmOption = screen.getByRole('option', { name: 'PMCM' });
    fireEvent.click(pmcmOption);

    // Verify the selection was made
    await waitFor(() => {
      expect(button).toHaveTextContent('PMCM');
    });
  });

  it('should update remarks when the text field is changed', async () => {
    const user = userEvent.setup();
    const remarksField = screen.getByRole('textbox', { name: /remarks/i });

    await user.type(remarksField, ', Updated remarks');

    // Assert that the value has been updated
    expect(remarksField).toHaveValue('Initial remarks, Updated remarks');
  });

  it('should render location dropdown', () => {
    const locationDropdown = screen.getByTestId('location-paginated-dropdown');

    // Verify the dropdown is present
    expect(locationDropdown).toBeInTheDocument();
  });

  it('should validate flight hours correctly', async () => {
    const user = userEvent.setup();
    const totalHoursField = screen.getByRole('spinbutton', { name: /Total Flight Hours/i });
    const monthlyHoursField = screen.getByRole('spinbutton', { name: /Monthly Flight Hours/i });

    // Simulate entering invalid flight hours
    await user.clear(totalHoursField);
    await user.type(totalHoursField, '50');
    await user.clear(monthlyHoursField);
    await user.type(monthlyHoursField, '60');

    // Simulate blur to trigger validation
    fireEvent.blur(monthlyHoursField);

    // Assert that the validation error is displayed
    expect(screen.getAllByText('Monthly flight hours cannot exceed total flight hours.').length).toBe(2);
  });

  it('should call handleSave when the Save Changes button is clicked', async () => {
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSetUpdatedRows).toHaveBeenCalled();
      expect(mockSetShowSnackbar).toHaveBeenCalledWith(true);
    });
  });
});