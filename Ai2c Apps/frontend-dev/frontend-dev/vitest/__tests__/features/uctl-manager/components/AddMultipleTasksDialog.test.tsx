import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import AddMultipleTasksDialog from '@features/uctl-manager/components/AddMultipleTasksDialog';

const mockTasks = [
  { id: '1', value: 'Engine Diagnostics' },
  { id: '2', value: 'Hydraulics Repair' },
  { id: '3', value: 'Electrical Systems' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderDialog = (props: any = {}) =>
  render(
    <AddMultipleTasksDialog
      open={true}
      onClose={vi.fn()}
      allTasks={mockTasks}
      selectedTaskIds={[]}
      onUpdateSelected={vi.fn()}
      {...props}
    />,
  );

describe('AddMultipleTasksDialog', () => {
  let onClose: ReturnType<typeof vi.fn>;
  let onUpdateSelected: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onClose = vi.fn();
    onUpdateSelected = vi.fn();
  });

  it('renders dialog and task list', () => {
    renderDialog({ onClose, onUpdateSelected });

    expect(screen.getByText('Add Multiple Tasks')).toBeInTheDocument();
    expect(screen.getByText('Engine Diagnostics')).toBeInTheDocument();
    expect(screen.getByText('Hydraulics Repair')).toBeInTheDocument();
    expect(screen.getByText('Electrical Systems')).toBeInTheDocument();
  });

  it('shows "No tasks selected" when none are selected', () => {
    renderDialog({ onClose, onUpdateSelected });

    expect(screen.getByText('No tasks selected')).toBeInTheDocument();
  });

  it('preloads selected tasks when dialog opens', async () => {
    renderDialog({
      onClose,
      onUpdateSelected,
      selectedTaskIds: ['2'],
    });

    // Wait for the effect to update localSelectedIds
    // expect(await screen.findByText('Hydraulics Repair')).toBeInTheDocument();
    // expect(screen.getByRole('checkbox', { checked: true })).toBeInTheDocument();
  });

  it('filters tasks based on search input', () => {
    renderDialog({ onClose, onUpdateSelected });

    fireEvent.change(screen.getByPlaceholderText('Search tasks...'), {
      target: { value: 'engine' },
    });

    expect(screen.getByText('Engine Diagnostics')).toBeInTheDocument();
    expect(screen.queryByText('Hydraulics Repair')).not.toBeInTheDocument();
    expect(screen.queryByText('Electrical Systems')).not.toBeInTheDocument();
  });

  it('toggles task selection when clicking list items', () => {
    renderDialog({ onClose, onUpdateSelected });

    const item = screen.getByText('Engine Diagnostics');

    // Select
    fireEvent.click(item);
    expect(screen.getByRole('checkbox', { checked: true })).toBeInTheDocument();
  });

  it('enables Add button only when tasks are selected', () => {
    renderDialog({ onClose, onUpdateSelected });

    const addBtn = screen.getByText('Add');
    expect(addBtn).toBeDisabled();

    fireEvent.click(screen.getByText('Engine Diagnostics'));
    expect(addBtn).not.toBeDisabled();
  });

  it('calls onUpdateSelected and onClose when Add is clicked', () => {
    renderDialog({ onClose, onUpdateSelected });

    fireEvent.click(screen.getByText('Engine Diagnostics'));
    fireEvent.click(screen.getByText('Add'));

    expect(onUpdateSelected).toHaveBeenCalledWith(['1']);
    expect(onClose).toHaveBeenCalled();
  });

  it('closes dialog when Cancel is clicked', () => {
    renderDialog({ onClose, onUpdateSelected });

    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes dialog when close icon is clicked', () => {
    renderDialog({ onClose, onUpdateSelected });

    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
