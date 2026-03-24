import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import { ModAircraftAssignment } from '@features/equipment-manager/mods/helper';
import EditSerialNumber from '@features/equipment-manager/mods/ModEditSteps/EditSerialNumber';

describe('EditSerialNumber', () => {
  const mockSetAssignedAircraft = vi.fn();

  const mockAssignedAircraft: ModAircraftAssignment[] = [
    { id: 1, serialNumber: 'SN-001', aircraft: 'Boeing 737' },
    { id: 2, serialNumber: 'SN-002', aircraft: 'Airbus A320' },
  ];

  it('should render all assigned aircraft with correct serial numbers', () => {
    render(<EditSerialNumber assignedAircraft={mockAssignedAircraft} setAssignedAircraft={mockSetAssignedAircraft} />);

    expect(screen.getByText('Edit mod SN SN-001.')).toBeInTheDocument();
    expect(screen.getByText('Edit mod SN SN-002.')).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('SN-001');
    expect(inputs[1]).toHaveValue('SN-002');
  });

  it('should update the correct aircraft when serial number is changed', () => {
    render(<EditSerialNumber assignedAircraft={mockAssignedAircraft} setAssignedAircraft={mockSetAssignedAircraft} />);

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'SN-999' } });

    const updateFunction = mockSetAssignedAircraft.mock.calls[0][0];
    const result = updateFunction(mockAssignedAircraft);

    expect(result).toEqual([
      { id: 1, serialNumber: 'SN-999', aircraft: 'Boeing 737' },
      { id: 2, serialNumber: 'SN-002', aircraft: 'Airbus A320' },
    ]);
  });

  it('should preserve original serial number in Typography when textfield is updated', () => {
    const { rerender } = render(
      <EditSerialNumber assignedAircraft={mockAssignedAircraft} setAssignedAircraft={mockSetAssignedAircraft} />,
    );

    expect(screen.getByText('Edit mod SN SN-001.')).toBeInTheDocument();

    const updatedAircraft = [
      { id: 1, serialNumber: 'SN-999', aircraft: 'Boeing 737' },
      { id: 2, serialNumber: 'SN-002', aircraft: 'Airbus A320' },
    ];

    rerender(<EditSerialNumber assignedAircraft={updatedAircraft} setAssignedAircraft={mockSetAssignedAircraft} />);

    // Original serial number should still be displayed
    expect(screen.getByText('Edit mod SN SN-001.')).toBeInTheDocument();

    // But textfield should show updated value
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('SN-999');
  });
});
