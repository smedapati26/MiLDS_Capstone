import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import DeleteTaskDialog from '@features/uctl-manager/components/DeleteTaskDialog';
import { useDeleteTaskMutation } from '@store/amap_ai/tasks/slices/tasksApi';

vi.mock('@context/SnackbarProvider', () => ({
  useSnackbar: () => ({
    showAlert: vi.fn(),
  }),
}));

vi.mock('@store/amap_ai/tasks/slices/tasksApi', () => ({
  useDeleteTaskMutation: vi.fn(),
}));

const mockTask = {
  taskNumber: 123,
  taskTitle: 'Engine Diagnostics',
};

describe('DeleteTaskDialog', () => {
  const mockDelete = vi.fn();
  const mockHandleClose = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    (useDeleteTaskMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue([mockDelete, { isLoading: false }]);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderDialog = (props: any = {}) =>
    render(<DeleteTaskDialog task={mockTask} open={true} handleClose={mockHandleClose} {...props} />);

  it('renders dialog content correctly', () => {
    renderDialog();

    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText(/Engine Diagnostics/)).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls handleClose when Cancel is clicked', () => {
    renderDialog();

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockHandleClose).toHaveBeenCalled();
  });

  it('calls deleteTask and closes dialog on Delete', async () => {
    mockDelete.mockReturnValue({
      unwrap: () => Promise.resolve(),
    });

    renderDialog();

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith({ task_number: 123 });
      expect(mockHandleClose).toHaveBeenCalled();
    });
  });

  it('disables Delete button when loading', () => {
    (useDeleteTaskMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue([mockDelete, { isLoading: true }]);

    renderDialog();

    const deleteBtn = screen.getByText('Delete');
    expect(deleteBtn).toBeDisabled();
  });
});
