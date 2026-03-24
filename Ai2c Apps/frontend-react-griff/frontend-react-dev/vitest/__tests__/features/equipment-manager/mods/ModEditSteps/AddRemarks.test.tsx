import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AddRemarksStep from '@features/equipment-manager/mods/ModEditSteps/AddRemarks';

const mockRemarks = 'Test Remarks';
const mockSetRemarks = vi.fn();

describe('AddRemarksStep Test', () => {

  beforeEach(() => {
    render(<AddRemarksStep remarks={mockRemarks} setRemarks={mockSetRemarks} />);
  });

  it('should render all components with their labels', () => {
    expect(screen.getByLabelText('Remarks')).toBeInTheDocument();
    expect(screen.getByTestId('add-remarks-textbox')).toBeInTheDocument();
    
    const remarksTextbox = screen.getByTestId('add-remarks-textbox-input' );
    expect(remarksTextbox).toHaveTextContent(mockRemarks);
  });

  it('should call setRemarks with the correct values when remarks is updated', async () => {
    const remarksTextbox = screen.getByTestId('add-remarks-textbox-input' );
    
    await userEvent.type(remarksTextbox, '.');
    expect(mockSetRemarks).toHaveBeenCalledWith(mockRemarks + '.');
  });
});
