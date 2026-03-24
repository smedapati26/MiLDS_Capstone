import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import FormActions from '@features/amtp-packet/components/maintainer-record/FormActions';

describe('FormActions Component', () => {
  const mockHandleClose = vi.fn();

  const defaultProps = {
    handleClose: mockHandleClose,
    isLoading: false,
    isUpdating: false,
  };

  it('renders the cancel button and calls handleClose on click', () => {
    render(<FormActions {...defaultProps} canSubmit={true} />);

    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);
    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });

  it('renders the save button enabled when both signatures are present', () => {
    render(<FormActions {...defaultProps} canSubmit={true} />);

    const saveButton = screen.getByText('Save Event');
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).not.toBeDisabled();
  });

  it('disables the save button when either signature is missing', () => {
    render(<FormActions {...defaultProps} canSubmit={false} />);

    const saveButton = screen.getByText('Save Event');
    expect(saveButton).toBeDisabled();
  });

  it('shows a loading indicator when isLoading or isUpdating is true', () => {
    render(<FormActions {...defaultProps} isLoading={true} canSubmit={true} />);

    const loadingIndicator = screen.getByRole('progressbar');
    expect(loadingIndicator).toBeInTheDocument();
  });
});
