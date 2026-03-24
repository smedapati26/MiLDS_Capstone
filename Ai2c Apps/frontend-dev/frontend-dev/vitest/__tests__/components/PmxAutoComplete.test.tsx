import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import PmxAutoComplete from '@components/PmxAutoComplete';

const mockOptions = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];

describe('PmxAutoComplete', () => {
  it('renders with given label and options', () => {
    render(<PmxAutoComplete options={mockOptions} value={[]} onChange={() => {}} label="Test Label" />);

    // Check if the label is rendered
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();

    // Open the dropdown
    const inputElement = screen.getByRole('combobox');
    fireEvent.mouseDown(inputElement);

    // Check if options are displayed
    mockOptions.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('calls onChange when an option is selected', () => {
    const mockOnChange = vi.fn();

    render(<PmxAutoComplete options={mockOptions} value={[]} onChange={mockOnChange} label="Test Label" />);

    // Open the dropdown
    const inputElement = screen.getByRole('combobox');
    fireEvent.mouseDown(inputElement);

    // Select an option
    const optionToSelect = screen.getByText('Option 1');
    fireEvent.click(optionToSelect);

    // Assert onChange was called with the selected option
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith([{ label: 'Option 1', value: '1' }]);
  });

  it('shows loading indicator when loading is true', () => {
    render(<PmxAutoComplete options={mockOptions} value={[]} onChange={() => {}} label="Test Label" loading={true} />);

    // Check if the loading indicator is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays helper text when provided', () => {
    render(
      <PmxAutoComplete
        options={mockOptions}
        value={[]}
        onChange={() => {}}
        label="Test Label"
        helperText="Test helper text"
      />,
    );

    // Check if the helper text is displayed
    expect(screen.getByText('Test helper text')).toBeInTheDocument();
  });
});
