import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';

import { fireEvent, screen } from '@testing-library/react';

import ActionBtns from '@components/ActionBtns';

describe('ActionBtns Component', () => {
  it('calls handleEdit when the edit button is clicked', () => {
    const handleEdit = vi.fn();
    const handleView = vi.fn();

    renderWithProviders(<ActionBtns handleEdit={handleEdit} handleView={handleView} hasAttachments />);

    const editButton = screen.getByLabelText('edit');
    fireEvent.click(editButton);

    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(handleView).not.toHaveBeenCalled();
  });

  it('calls handleView when the view button is clicked', () => {
    const handleEdit = vi.fn();
    const handleView = vi.fn();

    renderWithProviders(<ActionBtns handleEdit={handleEdit} handleView={handleView} hasAttachments />);

    const viewButton = screen.getByLabelText('view');
    fireEvent.click(viewButton);

    expect(handleView).toHaveBeenCalledTimes(1);
    expect(handleEdit).not.toHaveBeenCalled();
  });
});
