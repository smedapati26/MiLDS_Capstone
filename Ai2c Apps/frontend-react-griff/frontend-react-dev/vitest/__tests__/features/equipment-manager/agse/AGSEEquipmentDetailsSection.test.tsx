import { vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AGSEEquipmentDetailsSection from '@features/equipment-manager/agse/AGSEEquipmentDetailsSection';
import { useEquipmentManagerContext } from '@features/equipment-manager/EquipmentManagerContext';

import { IAGSESubordinate } from '@store/griffin_api/agse/models';
import { useGetAGSESubordinateQuery } from '@store/griffin_api/agse/slices/agseApi';

import { ThemedTestingComponent } from '@vitest/helpers';

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

vi.mock('@features/equipment-manager/EquipmentManagerContext', () => ({
  useEquipmentManagerContext: vi.fn(),
}));

vi.mock('@store/griffin_api/agse/slices/agseApi', () => ({
  useGetAGSESubordinateQuery: vi.fn(),
}));

vi.mock('@store/griffin_api/aircraft/slices', () => ({
  useGetAircraftByUicQuery: vi.fn(() => [{ data: [] }]),
}));

vi.mock('@store/griffin_api/mods/slices', () => ({
  useGetModificationTypesQuery: vi.fn(() => [{ data: [] }]),
  useAddNewModificationMutation: vi.fn(() => [vi.fn()]),
}));

const mockSubordinateData: IAGSESubordinate[] = [
  {
    subordinate: 'Subordinate 1',
    displayName: 'Display Name 1',
    shortName: 'Short Name 1',
    uic: 'TEST001',
    agse: [
      {
        equipmentNumber: '12345',
        model: 'Model X',
        displayName: 'Unit A',
        status: 'FMC',
        location: { id: 1, code: 'LOC1', name: 'Location 1' },
        lin: '',
        serialNumber: '',
        condition: '',
        currentUnit: '',
        currentUnitShortName: '',
        nomenclature: '',
        earliestNmcStart: null,
        daysNmc: null,
        remarks: null,
        earliestNmcStartCount: null,
      },
      {
        equipmentNumber: '67890',
        model: 'Model Y',
        displayName: 'Unit A',
        status: 'PMC',
        location: { id: 2, code: 'LOC2', name: 'Location 2' },
        lin: '',
        serialNumber: '',
        condition: '',
        currentUnit: '',
        currentUnitShortName: '',
        nomenclature: '',
        earliestNmcStart: null,
        daysNmc: null,
        remarks: null,
        earliestNmcStartCount: null,
      },
    ],
    syncs: [
      {
        equipmentNumber: '12345',
        syncCondition: true,
        syncRemarks: true,
        syncEarliestNmcStart: true,
        syncLocation: true,
      },
      {
        equipmentNumber: '67890',
        syncCondition: true,
        syncRemarks: true,
        syncEarliestNmcStart: true,
        syncLocation: true,
      },
    ],
  },
];

describe('AGSEEquipmentDetailsSection Component', () => {
  beforeEach(() => {
    (useEquipmentManagerContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      chosenUic: 'UIC123',
    });

    (useGetAGSESubordinateQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockSubordinateData,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(
      <ThemedTestingComponent>
        <AGSEEquipmentDetailsSection />
      </ThemedTestingComponent>,
    );
  });

  it('should render the component with all sections', () => {
    expect(screen.getByTestId('agse-equipment-details')).toBeInTheDocument();
    expect(screen.getByText('Equipment')).toBeInTheDocument();
    expect(screen.getByText('AGSE Details')).toBeInTheDocument();
  });

  it('should render the EquipmentManagerDetails table with data', () => {
    const button = screen.getByTestId('em-expand-collapse-all');
    fireEvent.click(button);

    expect(screen.getByText('Short Name 1 (TEST001)')).toBeInTheDocument();
    expect(screen.getByText('Display Name 1')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('FMC')).toBeInTheDocument();
    expect(screen.getByText('LOC1')).toBeInTheDocument();
  });

  it('should open the multi-edit modal when multiple rows are selected and edit is clicked', async () => {
    const button = screen.getByTestId('em-expand-collapse-all');
    fireEvent.click(button);

    // continuing from before, clicks on the second checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByTestId('agse-multi-edit')).toBeInTheDocument();
    });
  });
});
