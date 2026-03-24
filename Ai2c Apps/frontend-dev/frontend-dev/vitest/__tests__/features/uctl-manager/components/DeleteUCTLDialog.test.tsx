import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import DeleteUCTLDialog from '@features/uctl-manager/components/DeleteUCTLDialog';
import { useDeleteUCTLMutation } from '@store/amap_ai/tasks/slices/tasksApi';

vi.mock('@context/SnackbarProvider', () => ({
  useSnackbar: () => ({
    showAlert: vi.fn(),
  }),
}));

vi.mock('@store/amap_ai/tasks/slices/tasksApi', () => ({
  useDeleteUCTLMutation: vi.fn(),
}));

const mockUCTL = {
  ictlId: 42,
  ictlTitle: 'Weapons Maintenance',
};

describe('DeleteUCTLDialog', () => {
  const mockDelete = vi.fn();
  const mockHandleClose = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    (useDeleteUCTLMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue([mockDelete, { isLoading: false }]);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderDialog = (props: any = {}) =>
    render(<DeleteUCTLDialog uctl={mockUCTL} open={true} handleClose={mockHandleClose} {...props} />);

  it('renders dialog content correctly', () => {
    renderDialog();

    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText(/Weapons Maintenance/)).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls handleClose when Cancel is clicked', () => {
    renderDialog();

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockHandleClose).toHaveBeenCalled();
  });

  it('calls deleteUCTL and closes dialog on Delete', async () => {
    mockDelete.mockReturnValue({
      unwrap: () => Promise.resolve(),
    });

    renderDialog();

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith({ ictl_id: 42 });
      expect(mockHandleClose).toHaveBeenCalled();
    });
  });

  it('disables Delete button when loading', () => {
    (useDeleteUCTLMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue([mockDelete, { isLoading: true }]);

    renderDialog();

    const deleteBtn = screen.getByText('Delete');
    expect(deleteBtn).toBeDisabled();
  });
});
