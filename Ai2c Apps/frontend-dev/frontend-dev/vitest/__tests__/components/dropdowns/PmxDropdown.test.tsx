import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import { PmxDropdown } from '@components/dropdowns';

const sampleOptions = ['Option1', 'Option2', 'Option3'];

describe('PmxDropdown', () => {
  it('renders correctly', () => {
    render(<PmxDropdown label="Test Label" value="" options={sampleOptions} onChange={() => {}} />);
    const labelElement = screen.getAllByText('Test Label');
    expect(labelElement).toHaveLength(2);
  });

  it('handles selecting an option', () => {
    const handleChange = vi.fn();
    render(<PmxDropdown label="Test Label" value="" options={sampleOptions} onChange={handleChange} />);

    // Open the dropdown
    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);

    // Select the first option
    const firstOption = screen.getByText('Option1');
    fireEvent.click(firstOption);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('Option1');
  });
});
