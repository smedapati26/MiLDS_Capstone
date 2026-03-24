import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import PmxToggleBtnGroup from '@components/PmxToggleBtnGroup';

const mockButtons = [
  { value: 'button1', label: 'Button 1' },
  { value: 'button2', label: 'Button 2', disabled: true },
  { value: 'button3', label: 'Button 3' },
];

describe('PmxToggleBtnGroup', () => {
  it('renders buttons correctly with labels and disabled states', () => {
    render(<PmxToggleBtnGroup buttons={mockButtons} selected="" onChange={() => {}} orientation="horizontal" />);

    // Check if buttons are rendered with correct labels
    mockButtons.forEach((button) => {
      expect(screen.getByText(button.label)).toBeInTheDocument();
    });

    // Check if disabled button is properly disabled
    const disabledButton = screen.getByText('Button 2').closest('button');
    expect(disabledButton).toBeDisabled();
  });

  it('calls onChange when a button is clicked (single selection)', () => {
    const mockOnChange = vi.fn();

    render(<PmxToggleBtnGroup buttons={mockButtons} selected="" onChange={mockOnChange} orientation="horizontal" />);

    // Click a button
    const button = screen.getByText('Button 1').closest('button');
    if (button) {
      fireEvent.click(button);

      // Assert onChange was called with the correct value
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith('button1');
    }
  });

  it('renders buttons in vertical orientation when specified', () => {
    render(<PmxToggleBtnGroup buttons={mockButtons} selected="" onChange={() => {}} orientation="vertical" />);

    // Check if buttons are rendered with vertical orientation
    const buttonGroup = screen.getByRole('group');
    expect(buttonGroup).toHaveAttribute('aria-orientation', 'vertical');
  });
});
