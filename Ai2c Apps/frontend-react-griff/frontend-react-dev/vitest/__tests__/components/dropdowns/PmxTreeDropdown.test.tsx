import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, within } from '@testing-library/react';

import { PmxTreeDropdown } from '@ai2c/pmx-mui/components';

const sampleOptions = [
  {
    id: '1',
    value: 'Option 1',
    children: [
      { id: '1-1', value: 'Option 1-1' },
      { id: '1-2', value: 'Option 1-2' },
    ],
  },
  { id: '2', value: 'Option 2', children: [{ id: '2-1', value: 'Option 2-1' }] },
  { id: '3', value: 'Option 3', children: [] },
];

const nestedSampleOptions = [
  {
    id: '1',
    value: 'Option 1',
    children: [
      {
        id: '1-2',
        value: 'Option 1-2',
        children: [
          { id: '1-2-1', value: 'Option 1-2-1' },
          { id: '1-2-2', value: 'Option 1-2-2' },
        ],
      },
    ],
  },
];

describe('PmxTreeDropdown', () => {
  it('renders correctly', () => {
    render(<PmxTreeDropdown label="Test Label" values={[]} options={sampleOptions} onChange={() => {}} renderChips />);

    const labelElement = screen.getAllByText('Test Label');
    expect(labelElement).toHaveLength(2);
  });

  it('handles selecting and deselecting all options', () => {
    const handleChange = vi.fn();
    render(
      <PmxTreeDropdown label="Test Label" values={[]} options={sampleOptions} onChange={handleChange} renderChips />,
    );
    // Open the dropdown
    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    // Select All
    const selectAllCheckbox = screen.getByText('Select All').closest('div');
    if (selectAllCheckbox) {
      const selectAllOptionCheckbox = within(selectAllCheckbox).getByRole('checkbox');
      fireEvent.click(selectAllOptionCheckbox);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(['1', '1-1', '1-2', '2', '2-1', '3']);
    }
  });

  it('handles selecting and deselecting options', () => {
    const handleChange = vi.fn();
    render(
      <PmxTreeDropdown label="Test Label" values={[]} options={sampleOptions} onChange={handleChange} renderChips />,
    );

    // Open the dropdown
    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);

    // Select first option
    const firstOptionDiv = screen.getByText('Option 1').closest('div');
    if (firstOptionDiv) {
      const firstOptionCheckbox = within(firstOptionDiv).getByRole('checkbox');
      fireEvent.click(firstOptionCheckbox);
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(['1', '1-1', '1-2']);

      // Deselect first option
      fireEvent.click(firstOptionCheckbox);
      expect(handleChange).toHaveBeenCalledTimes(2);
    } else {
      console.error('First option div not found');
    }
  });

  it('handles selecting and deselecting child options', () => {
    const handleChange = vi.fn();
    render(
      <PmxTreeDropdown label="Test Label" values={[]} options={sampleOptions} onChange={handleChange} renderChips />,
    );

    // Open the dropdown
    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);

    // Expand first option
    const firstOptionButton = screen.getByText('Option 1').closest('button');
    if (firstOptionButton) {
      fireEvent.click(firstOptionButton);

      // Select first child option
      const firstChildOptionDiv = screen.getByText('Option 1-1').closest('div');
      if (firstChildOptionDiv) {
        const firstChildOptionCheckbox = within(firstChildOptionDiv).getByRole('checkbox');
        fireEvent.click(firstChildOptionCheckbox);
        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledWith(['1-1']);

        // Deselect first child option
        fireEvent.click(firstChildOptionCheckbox);
        expect(handleChange).toHaveBeenCalledTimes(2);
      } else {
        console.error('First child option div not found');
      }
    } else {
      console.error('First option button not found');
    }
  });
  it('handles nested children selection correctly', () => {
    const handleChange = vi.fn();
    render(
      <PmxTreeDropdown
        label="Test Label"
        values={[]}
        options={nestedSampleOptions}
        onChange={handleChange}
        renderChips
      />,
    );

    // Open the dropdown
    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);

    // Find and click the first IconButton within the menu
    const menuElement = screen.getByRole('listbox');
    const parentIconButton = within(menuElement).getAllByRole('button')[0];
    fireEvent.click(parentIconButton);

    // Find and click the nested IconButton
    const nestedIconButton = within(menuElement).getAllByRole('button')[1];
    fireEvent.click(nestedIconButton);

    // Select nested child using the first checkbox we find after the text
    const nestedChildText = within(menuElement).getByText('Option 1-2-1');
    const checkboxes = within(nestedChildText.closest('div')!).getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(handleChange).toHaveBeenCalledWith(['1-2-1']);
    const menuItems = screen.getAllByRole('menuitem');
    menuItems.forEach((item) => {
      item.querySelector('[class*="MuiBox-root"]');
    });
  });
  it('applies correct level padding', () => {
    const handleChange = vi.fn();
    render(
      <PmxTreeDropdown
        label="Test Label"
        values={[]}
        options={nestedSampleOptions}
        onChange={handleChange}
        renderChips
      />,
    );

    // Open the dropdown
    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);

    // Find and click the first IconButton within the menu
    const menuElement = screen.getByRole('listbox');
    const parentIconButton = within(menuElement).getAllByRole('button')[0];
    fireEvent.click(parentIconButton);

    // Find and click the nested IconButton
    const nestedIconButton = within(menuElement).getAllByRole('button')[1];
    fireEvent.click(nestedIconButton);

    const menuItems = screen.getAllByRole('menuitem');
    const boxes = menuItems.map((item) => item.querySelector('[class*="MuiBox-root"]'));

    const expectedPaddings = ['24px', '56px', '122.4px', '122.4px'];
    boxes.forEach((box, index) => {
      expect(window.getComputedStyle(box!).paddingLeft).toBe(expectedPaddings[index]);
    });
  });
});
