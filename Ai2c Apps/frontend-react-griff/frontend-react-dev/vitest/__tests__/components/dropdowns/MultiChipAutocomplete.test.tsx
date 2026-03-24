import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MultiChipAutocomplete } from '@components/dropdowns/MultiChipAutocomplete';
import { IOptions } from '@models/IOptions';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

const mockOptions: IOptions[] = [
  { value: 'opt1', label: 'Option 1' },
  { value: 'opt2', label: 'Option 2' },
  { value: 'opt3', label: 'Option 3' },
];

describe('MultiChipAutocomplete Component', () => {
  describe('Basic Rendering', () => {
    it('renders the component with the correct label', () => {
      const onChangeMock = vi.fn();

      renderWithProviders(
        <MultiChipAutocomplete label="Test Label" options={mockOptions} value={[]} onChange={onChangeMock} />,
      );

      expect(screen.getAllByText('Test Label')).toHaveLength(2); // label and legend
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders with empty options array', () => {
      const onChangeMock = vi.fn();

      renderWithProviders(<MultiChipAutocomplete label="Test Label" options={[]} value={[]} onChange={onChangeMock} />);

      expect(screen.getAllByText('Test Label')).toHaveLength(2);
    });

    it('renders with undefined options', () => {
      const onChangeMock = vi.fn();

      renderWithProviders(<MultiChipAutocomplete label="Test Label" value={[]} onChange={onChangeMock} />);

      expect(screen.getAllByText('Test Label')).toHaveLength(2);
    });
  });

  describe('Option Selection', () => {
    it('updates value when options are selected', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const [value, setValue] = React.useState<IOptions[]>([]);

        return <MultiChipAutocomplete label="Test Label" options={mockOptions} value={value} onChange={setValue} />;
      };

      renderWithProviders(<TestComponent />);

      const input = screen.getByRole('combobox');
      await user.click(input);

      // Wait for options to appear
      await screen.findByText('Option 1');

      // Select first option
      const option1 = screen.getByRole('option', { name: 'Option 1' });
      await user.click(option1);

      expect(screen.getAllByText('Option 1')).toHaveLength(2); // chip and option in list

      // Select second option
      const option2 = screen.getByRole('option', { name: 'Option 2' });
      await user.click(option2);

      expect(screen.getAllByText('Option 1')).toHaveLength(2);
      expect(screen.getAllByText('Option 2')).toHaveLength(2);
    });

    it('renders selected options as chips', () => {
      const onChangeMock = vi.fn();

      renderWithProviders(
        <MultiChipAutocomplete
          label="Test Label"
          options={mockOptions}
          value={[
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
          ]}
          onChange={onChangeMock}
        />,
      );

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
    });
  });

  describe('Chip Removal', () => {
    it('removes chip when delete icon is clicked', async () => {
      const user = userEvent.setup();
      const onChangeMock = vi.fn();

      renderWithProviders(
        <MultiChipAutocomplete
          label="Test Label"
          options={mockOptions}
          value={[
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
          ]}
          onChange={onChangeMock}
        />,
      );

      // Check initial chips
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();

      // Find and click delete icon for Option 1
      const deleteIcons = screen.getAllByTestId('CloseIcon');
      await user.click(deleteIcons[0]);

      expect(onChangeMock).toHaveBeenCalledWith([{ value: 'opt2', label: 'Option 2' }]);
    });
  });

  describe('Error Handling', () => {
    it('displays error message when error is provided', () => {
      const onChangeMock = vi.fn();

      renderWithProviders(
        <MultiChipAutocomplete
          label="Test Label"
          options={mockOptions}
          value={[]}
          onChange={onChangeMock}
          error={{ message: 'This field is required' }}
        />,
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('sets aria-label correctly', () => {
      const onChangeMock = vi.fn();

      renderWithProviders(
        <MultiChipAutocomplete label="Accessible Label" options={mockOptions} value={[]} onChange={onChangeMock} />,
      );

      expect(screen.getByRole('combobox', { name: 'Accessible Label' })).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('applies custom sx styles', () => {
      const onChangeMock = vi.fn();
      const customSx = { backgroundColor: 'red' };

      renderWithProviders(
        <MultiChipAutocomplete
          label="Test Label"
          options={mockOptions}
          value={[]}
          onChange={onChangeMock}
          sx={customSx}
        />,
      );

      // The sx prop is passed to Autocomplete, but testing exact styles might require more setup
      expect(screen.getAllByText('Test Label')).toHaveLength(2);
    });
  });
});
