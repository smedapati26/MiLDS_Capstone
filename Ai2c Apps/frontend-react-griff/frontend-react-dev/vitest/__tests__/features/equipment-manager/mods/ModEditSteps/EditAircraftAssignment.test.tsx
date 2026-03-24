import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import * as EquipmentManagerContext from '@features/equipment-manager/EquipmentManagerContext';
import EditAircraftAssignmentStep from '@features/equipment-manager/mods/ModEditSteps/EditAircraftAssignment';

import { useGetAircraftByUicQuery } from '@store/griffin_api/aircraft/slices';
import { useAppSelector } from '@store/hooks';

const mockAssignedAircraft = [
  { id: 1, serialNumber: '11111', aircraft: undefined },
  { id: 2, serialNumber: '22222', aircraft: '12345' },
];
const mockSetAssignedAircraft = vi.fn();

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/aircraft/slices', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useGetAircraftByUicQuery: vi.fn(),
  };
});

describe('EditAircraftAssignment Test', () => {
  beforeEach(() => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');
    (useGetAircraftByUicQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ serial: '12345' }, { serial: '54321' }],
    });

    render(
      <EquipmentManagerContext.EquipmentManagerProvider>
        <EditAircraftAssignmentStep
          assignedAircraft={mockAssignedAircraft}
          setAssignedAircraft={mockSetAssignedAircraft}
        />
      </EquipmentManagerContext.EquipmentManagerProvider>,
    );
  });

  it('should render all components with their labels', () => {
    expect(screen.getByTestId(`aircraft-select-for-${mockAssignedAircraft[0].id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`aircraft-select-for-${mockAssignedAircraft[1].id}`)).toBeInTheDocument();

    expect(
      screen.getByText(`Select an aircraft to assign ${mockAssignedAircraft[0].serialNumber} to.`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Select an aircraft to assign ${mockAssignedAircraft[1].serialNumber} to.`),
    ).toBeInTheDocument();
  });

  it('should call setAssignmentAircraft with the correct values when assignment is updated', async () => {
    const modSelectInput1 = screen.getByTestId(`aircraft-select-for-${mockAssignedAircraft[0].id}-input`);
    const modSelectInput2 = screen.getByTestId(`aircraft-select-for-${mockAssignedAircraft[1].id}-input`);

    expect(modSelectInput1).toHaveValue('');
    expect(modSelectInput2).toHaveValue(mockAssignedAircraft[1].aircraft);

    const dropdowns = screen.getAllByRole('combobox', { name: 'Aircraft Serial Number' });
    expect(dropdowns).toHaveLength(2);
    await userEvent.click(dropdowns[0]);

    const menuItems = screen.getAllByRole('option');
    expect(menuItems).toHaveLength(2);

    await userEvent.click(screen.getByRole('option', { name: '54321' }));
    expect(mockSetAssignedAircraft).toHaveBeenCalled();
  });
});
