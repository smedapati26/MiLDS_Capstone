import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, within } from '@testing-library/react';

import PmxMultiSelect from '@components/dropdowns/PmxMultiSelect';

const sampleOptions = ['Option1', 'Option2', 'Option3'];

describe('PmxMultiSelect', () => {
  it('renders correctly', () => {
    render(<PmxMultiSelect label="Test Label" values={[]} options={sampleOptions} onChange={() => {}} />);
    const labelElement = screen.getAllByText('Test Label');
    expect(labelElement).toHaveLength(2);
  });

  it('handles selecting and deselecting options', () => {
    const handleChange = vi.fn();
    render(<PmxMultiSelect label="Test Label" values={[]} options={sampleOptions} onChange={handleChange} />);

    // Open the dropdown
    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);

    const dropdown = document.querySelector('.MuiPaper-root') as HTMLElement;
    if (dropdown) {
      const firstOption = within(dropdown).getByTestId('Option1');
      fireEvent.click(firstOption);
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(['Option1']);

      // Deselect the first option
      fireEvent.click(firstOption);
      expect(handleChange).toHaveBeenCalledTimes(2);
      expect(handleChange).toHaveBeenCalledWith([]);
    }
  });
});
