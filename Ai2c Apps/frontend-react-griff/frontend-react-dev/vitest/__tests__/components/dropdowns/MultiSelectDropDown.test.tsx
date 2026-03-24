import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import MultiSelectDropDown from '@components/dropdowns/MultiSelectDropDown';

// Mock options for testing
const mockOptions = {
  apple: { label: 'Apple', value: 'apple' },
  banana: { label: 'Banana', value: 'banana' },
  cherry: { label: 'Cherry', value: 'cherry' },
  date: { label: 'Date', value: 'date' },
};

describe('MultiSelectDropDown Component', () => {
  // Test initial rendering
  it('renders the component with the correct label', () => {
    const onSelectionChangeMock = vi.fn();

    render(
      <MultiSelectDropDown
        isLoading={false}
        options={mockOptions}
        onSelectionChange={onSelectionChangeMock}
        label="Fruits"
      />,
    );

    // Check if the label is rendered
    expect(screen.getAllByText('Fruits')).toBeTruthy();
  });

  // Test initial selection
  it('renders with initial selection', () => {
    const onSelectionChangeMock = vi.fn();

    render(
      <MultiSelectDropDown
        isLoading={false}
        options={mockOptions}
        onSelectionChange={onSelectionChangeMock}
        label="Fruits"
        value={['apple', 'banana']}
      />,
    );

    // Verify initial selection text
    expect(screen.getByText('Apple, Banana')).toBeInTheDocument();
  });

  // Test selection behavior
  it('allows selecting and deselecting options', async () => {
    const onSelectionChangeMock = vi.fn();

    render(
      <MultiSelectDropDown
        isLoading={false}
        options={mockOptions}
        onSelectionChange={onSelectionChangeMock}
        label="Fruits"
      />,
    );

    const dropDownButton = screen.getByRole('combobox');

    // Open the dropdown
    fireEvent.mouseDown(dropDownButton);

    const appleOption = await screen.findByText('Apple');
    fireEvent.click(appleOption);

    // Verify callback was called with correct values
    expect(onSelectionChangeMock).toHaveBeenCalledWith(['apple']);
  });

  it('handles empty selection correctly', () => {
    const onSelectionChangeMock = vi.fn();

    render(
      <MultiSelectDropDown
        isLoading={false}
        options={mockOptions}
        onSelectionChange={onSelectionChangeMock}
        label="Fruits"
      />,
    );

    const dropDownButton = screen.getByRole('combobox');

    // Open the dropdown
    fireEvent.mouseDown(dropDownButton);

    // Close the dropdown
    fireEvent.keyDown(dropDownButton, { key: 'Escape', code: 'Escape', charCode: 27, bubbles: true });

    expect(onSelectionChangeMock).not.toHaveBeenCalled();
  });
});
