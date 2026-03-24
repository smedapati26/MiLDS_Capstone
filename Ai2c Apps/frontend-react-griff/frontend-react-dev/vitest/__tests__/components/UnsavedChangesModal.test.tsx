
import Box from '@mui/material/Box';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UnsavedChangesModal from '@components/UnsavedChangesModal';

import '@testing-library/jest-dom';

const mockSave = vi.fn();
const mockDiscard = vi.fn();
const mockCancel = vi.fn();

const renderTestComponent = (open: boolean = true) => {
  return render(
    <Box data-testid='test-component' component='div'>
      <UnsavedChangesModal open={open} handleSave={mockSave} handleDiscard={mockDiscard} handleCancel={mockCancel} />
    </Box>,
  );
};

/* UnsavedChangesModal Tests */
describe('UnsavedChangesModal Test', () => {
  afterEach(() => {
    mockSave.mockClear();
    mockDiscard.mockClear();
    mockCancel.mockClear();
  });

  it('Renders Relevant Components', () => {
    renderTestComponent();

    const modal = screen.getByLabelText('Unsaved Changes Modal');
    const modalTitle = screen.getByText('Leave Without Saving');
    const saveButton = screen.getByText('SAVE CHANGES');
    const discardButton = screen.getByText('DISCARD');
    const cancelButton = screen.getByText('CANCEL');

    expect(modal).toBeInTheDocument();
    expect(modalTitle).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();
    expect(discardButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  it('Does not render if not open', () => {
    renderTestComponent(false);

    const modal = screen.getByLabelText('Unsaved Changes Modal');
    const modalTitle = screen.queryByText('Leave Without Saving');
    const saveButton = screen.queryByText('SAVE CHANGES');
    const discardButton = screen.queryByText('DISCARD');
    const cancelButton = screen.queryByText('CANCEL');

    expect(modal).toBeInTheDocument();
    expect(modalTitle).not.toBeInTheDocument();
    expect(saveButton).not.toBeInTheDocument();
    expect(discardButton).not.toBeInTheDocument();
    expect(cancelButton).not.toBeInTheDocument();
  });

  it('Renders modal properly when changes are saved.', async () => {
    renderTestComponent();

    // Saves unsaved data and closes modal
    const saveButton = screen.getByText('SAVE CHANGES');
    await userEvent.click(saveButton);

    expect(mockSave).toHaveBeenCalled();
    expect(mockCancel).not.toHaveBeenCalled();
    expect(mockDiscard).not.toHaveBeenCalled();
  });

  it('Renders modal properly when changes are discarded.', async () => {
    renderTestComponent();

    // Discards unsaved data and closes modal
    const discardButton = screen.getByText('DISCARD');
    await userEvent.click(discardButton);

    expect(mockDiscard).toHaveBeenCalled();
    expect(mockSave).not.toHaveBeenCalled();
    expect(mockCancel).not.toHaveBeenCalled();
  });

  it('Renders modal properly when cancelled.', async () => {
    renderTestComponent();

    // Cancels request and closes modal
    const cancelButton = screen.getByText('CANCEL');
    await userEvent.click(cancelButton);

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSave).not.toHaveBeenCalled();
    expect(mockDiscard).not.toHaveBeenCalled();
  });
});
