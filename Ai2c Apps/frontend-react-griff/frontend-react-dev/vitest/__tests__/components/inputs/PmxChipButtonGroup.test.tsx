import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PmxChipButtonGroup } from '@components/inputs/PmxChipButtonGroup';

import { ThemedTestingComponent } from '../../../helpers/ThemedTestingComponent';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemedTestingComponent>{component}</ThemedTestingComponent>);
};

const stringOptions = ['Option1', 'Option2', 'Option3'];
const objectOptions = [
  { value: 'value1', label: 'Label1' },
  { value: 'value2', label: 'Label2' },
  { value: 'value3', label: 'Label3' },
];

describe('PmxChipButtonGroup', () => {
  describe('Basic Rendering', () => {
    it('renders chips with string options', () => {
      const handleChange = vi.fn();
      renderWithTheme(<PmxChipButtonGroup options={stringOptions} onChange={handleChange} />);

      expect(screen.getByText('Option1')).toBeInTheDocument();
      expect(screen.getByText('Option2')).toBeInTheDocument();
      expect(screen.getByText('Option3')).toBeInTheDocument();
    });

    it('renders chips with object options', () => {
      const handleChange = vi.fn();
      renderWithTheme(<PmxChipButtonGroup options={objectOptions} onChange={handleChange} />);

      expect(screen.getByText('Label1')).toBeInTheDocument();
      expect(screen.getByText('Label2')).toBeInTheDocument();
      expect(screen.getByText('Label3')).toBeInTheDocument();
    });

    it('renders label when provided', () => {
      const handleChange = vi.fn();
      renderWithTheme(<PmxChipButtonGroup options={stringOptions} onChange={handleChange} label="Test Label" />);

      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('does not render label when not provided', () => {
      const handleChange = vi.fn();
      renderWithTheme(<PmxChipButtonGroup options={stringOptions} onChange={handleChange} />);

      expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
    });
  });

  describe('Single Select Mode', () => {
    it('selects a chip on click and calls onChange with value', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderWithTheme(<PmxChipButtonGroup options={stringOptions} onChange={handleChange} />);

      const chip = screen.getByText('Option1');
      await user.click(chip);

      expect(handleChange).toHaveBeenCalledWith('Option1');
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('deselects a chip on second click and calls onChange with null', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderWithTheme(<PmxChipButtonGroup options={stringOptions} onChange={handleChange} />);

      const chip = screen.getByText('Option1');
      await user.click(chip);
      await user.click(chip);

      expect(handleChange).toHaveBeenCalledWith('Option1');
      expect(handleChange).toHaveBeenCalledWith(null);
      expect(handleChange).toHaveBeenCalledTimes(2);
    });

    it('selects only one chip in single select mode', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderWithTheme(<PmxChipButtonGroup options={stringOptions} onChange={handleChange} />);

      const chip1 = screen.getByText('Option1');
      const chip2 = screen.getByText('Option2');
      await user.click(chip1);
      await user.click(chip2);

      expect(handleChange).toHaveBeenCalledWith('Option1');
      expect(handleChange).toHaveBeenCalledWith('Option2');
      expect(handleChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Multi-Select Mode', () => {
    it('adds selection on click and calls onChange with array', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderWithTheme(<PmxChipButtonGroup options={stringOptions} onChange={handleChange} multiselect />);

      const chip = screen.getByText('Option1');
      await user.click(chip);

      expect(handleChange).toHaveBeenCalledWith(['Option1']);
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('removes selection on second click', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderWithTheme(<PmxChipButtonGroup options={stringOptions} onChange={handleChange} multiselect />);

      const chip = screen.getByText('Option1');
      await user.click(chip);
      await user.click(chip);

      expect(handleChange).toHaveBeenCalledWith(['Option1']);
      expect(handleChange).toHaveBeenCalledWith([]);
      expect(handleChange).toHaveBeenCalledTimes(2);
    });

    it('allows multiple selections', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderWithTheme(<PmxChipButtonGroup options={stringOptions} onChange={handleChange} multiselect />);

      const chip1 = screen.getByText('Option1');
      const chip2 = screen.getByText('Option2');
      await user.click(chip1);
      await user.click(chip2);

      expect(handleChange).toHaveBeenCalledWith(['Option1']);
      expect(handleChange).toHaveBeenCalledWith(['Option1', 'Option2']);
      expect(handleChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Disabled State', () => {
    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderWithTheme(<PmxChipButtonGroup options={stringOptions} onChange={handleChange} disabled />);

      const chip = screen.getByText('Option1');
      try {
        await user.click(chip);
      } catch {
        // Expected, since disabled chips can't be clicked
      }

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Initial Value', () => {
    it('sets initial selection with string value', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderWithTheme(<PmxChipButtonGroup options={stringOptions} onChange={handleChange} value="Option1" />);

      // Since it's initial, onChange not called yet, but selections are set
      // To test, perhaps click another to see behavior
      const chip2 = screen.getByText('Option2');
      await user.click(chip2);

      expect(handleChange).toHaveBeenCalledWith('Option2');
    });

    it('sets initial selection with array value', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderWithTheme(
        <PmxChipButtonGroup options={stringOptions} onChange={handleChange} value={['Option1']} multiselect />,
      );

      const chip1 = screen.getByText('Option1');
      await user.click(chip1); // should remove

      expect(handleChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Object Options', () => {
    it('uses value for selection and label for display', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      renderWithTheme(<PmxChipButtonGroup options={objectOptions} onChange={handleChange} />);

      const chip = screen.getByText('Label1');
      await user.click(chip);

      expect(handleChange).toHaveBeenCalledWith('value1');
    });
  });
});
