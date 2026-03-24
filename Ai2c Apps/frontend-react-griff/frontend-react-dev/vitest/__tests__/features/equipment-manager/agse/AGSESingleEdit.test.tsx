import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AGSESingleEdit from '@features/equipment-manager/agse/AGSESingleEdit';

import { IAGSE, ISync } from '@store/griffin_api/agse/models';
import { useGetAutoDsrLocationQuery } from '@store/griffin_api/auto_dsr/slices';
import { useAppSelector } from '@store/hooks';

import { ThemedTestingComponent } from '@vitest/helpers';

// const mockSetOpen = vi.fn();
const mockSetUpdatedRows = vi.fn();
const mockSetShowSnackbar = vi.fn();

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

const mockEdiAGSE = vi.fn(() => ({
  unwrap: () =>
    Promise.resolve({
      editedAGSE: ['12345'],
      notEditedAGSE: [],
      detail: 'string',
    }),
}));

vi.mock('@store/griffin_api/agse/slices', () => ({
  useEditAGSEMutation: () => [
    mockEdiAGSE, // mock mutation
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
const mockData: IAGSE = {
  equipmentNumber: '12345',
  model: 'Model X',
  displayName: 'Unit A',
  status: 'FMC',
  remarks: 'Initial remarks',
  location: { id: 1, code: 'LOC1', name: 'Location 1' },
  lin: '',
  serialNumber: '',
  condition: '',
  currentUnit: '',
  currentUnitShortName: '',
  nomenclature: '',
  earliestNmcStart: null,
  daysNmc: null,
  earliestNmcStartCount: null,
};

const mockSyncData: ISync = {
  syncCondition: true,
  syncRemarks: true,
  syncEarliestNmcStart: true,
  syncLocation: true,
  equipmentNumber: '',
};

describe('AGSESingleEdit Component', () => {
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
          <AGSESingleEdit
            open={open}
            setOpen={setOpen}
            data={mockData}
            syncData={mockSyncData}
            setUpdatedRows={mockSetUpdatedRows}
            setShowSnackbar={mockSetShowSnackbar}
          />
        </ThemedTestingComponent>
      );
    };

    render(<TestWrapper />);
  });

  it('should render the modal with all components', () => {
    expect(screen.getByTestId('agse-single-edit-paper')).toBeInTheDocument();
    expect(screen.getByText('Edit AGSE')).toBeInTheDocument();
    expect(screen.getByText('Serial Number:')).toBeInTheDocument();
    expect(screen.getByText('Model:')).toBeInTheDocument();
    expect(screen.getByText('Unit:')).toBeInTheDocument();
    expect(screen.getByText('Operational Readiness Status')).toBeInTheDocument();
    expect(screen.getByText('Additional Details')).toBeInTheDocument();
    expect(screen.getByText('Initial remarks')).toBeInTheDocument();
    expect(screen.getByLabelText('Auto-sync all AGSE data sources')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('handle close', () => {
    const button = screen.getByTestId('close-button');
    fireEvent.click(button);

    expect(screen.queryByTestId('agse-single-edit-paper')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should update ORStatus when a toggle button is clicked', () => {
    const pmcButton = screen.getByText('PMC');
    fireEvent.click(pmcButton);

    expect(pmcButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should update remarks when the text field is changed', async () => {
    const user = userEvent.setup();
    // const remarksField = screen.getByTestId('remarks') as HTMLInputElement;
    const remarksField = screen.getByRole('textbox', { name: /remarks/i });

    await user.type(remarksField, ', Updated remarks');

    // Assert that the value has been updated
    expect(remarksField).toHaveValue('Initial remarks, Updated remarks');
  });

  it('should update location when a new location is selected', async () => {
    const input = screen.getByRole('combobox');

    // Simulate typing into the input field
    await userEvent.type(input, 'LOC2');

    // Assert that the input value has been updated
    expect(input).toHaveValue('LOC2');
  });

  it('should toggle syncAll when the checkbox is clicked', () => {
    const syncCheckbox = screen.getByLabelText('Auto-sync all AGSE data sources');
    expect(syncCheckbox).toBeChecked();

    fireEvent.click(syncCheckbox);
    expect(syncCheckbox).not.toBeChecked();
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
