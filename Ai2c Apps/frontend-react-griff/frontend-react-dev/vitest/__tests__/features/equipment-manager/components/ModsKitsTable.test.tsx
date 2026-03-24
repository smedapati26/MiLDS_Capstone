import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import ModsKitsTable from '@features/equipment-manager/components/ModsKitsTable';

import { IAircraftModification } from '@store/griffin_api/aircraft/models';

const mockData: IAircraftModification[] = [
  { id: 1, modType: 'Modification Kit 1', value: 'Description 1' },
  { id: 2, modType: 'Modification Kit 2', value: 'Description 2' },
  { id: 3, modType: 'Modification Kit 3', value: 'Description 3' },
];

describe('ModsKitsTable Component', () => {
  it('renders the table with correct data', () => {
    const mockSetToDelete = vi.fn();

    render(<ModsKitsTable data={mockData} setToDelete={mockSetToDelete} />);

    // Check if the table is rendered
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Check if the rows are rendered
    mockData.forEach((row) => {
      expect(screen.getByText(row.modType)).toBeInTheDocument();
      expect(screen.getByText(row.value as string)).toBeInTheDocument();
    });

    // Check if the delete buttons are rendered
    const deleteButtons = screen.getAllByRole('button');
    expect(deleteButtons).toHaveLength(6);
  });

  it('handles row deletion correctly', () => {
    const mockSetToDelete = vi.fn();

    render(<ModsKitsTable data={mockData} setToDelete={mockSetToDelete} />);

    // Find the delete button for the first row
    const deleteButtons = screen.getAllByTestId('mods-kit-delete-button');

    // Click the delete button
    fireEvent.click(deleteButtons[0]);

    // Check if the row is removed from the table
    expect(screen.queryByText('Modification Kit 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Description 1')).not.toBeInTheDocument();
  });

  it('updates visible rows when data changes', () => {
    const mockSetToDelete = vi.fn();

    const { rerender } = render(<ModsKitsTable data={mockData} setToDelete={mockSetToDelete} />);

    // Check initial rows
    mockData.forEach((row) => {
      expect(screen.getByText(row.modType)).toBeInTheDocument();
    });

    // Update the data
    const newData: IAircraftModification[] = [{ id: 4, modType: 'Modification Kit 4', value: 'Description 4' }];
    rerender(<ModsKitsTable data={newData} setToDelete={mockSetToDelete} />);

    // Check if the rows are updated
    expect(screen.getByText('Modification Kit 4')).toBeInTheDocument();
    expect(screen.queryByText('Modification Kit 1')).not.toBeInTheDocument();
  });
});
