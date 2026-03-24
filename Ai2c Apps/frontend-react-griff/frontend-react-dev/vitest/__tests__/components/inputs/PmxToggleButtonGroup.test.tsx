import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PmxToggleButtonGroup } from '@components/inputs/PmxToggleButtonGroup';
import { IOptions } from '@models/IOptions';

import { ThemedTestingComponent } from '../../../helpers/ThemedTestingComponent';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemedTestingComponent>{component}</ThemedTestingComponent>);
};

const stringOptions = ['Option1', 'Option2', 'Option3'];

const iOptions: IOptions[] = [
  { label: 'Option 1', value: 'Option1' },
  { label: 'Option 2', value: 'Option2' },
  { label: 'Option 3', value: 'Option3' },
];

describe('PmxToggleButtonGroup', () => {
  describe('Basic Rendering', () => {
    it('renders toggle buttons with string options', () => {
      const handleSelection = vi.fn();
      renderWithTheme(<PmxToggleButtonGroup options={stringOptions} onChange={handleSelection} />);

      expect(screen.getByText('Option1')).toBeInTheDocument();
      expect(screen.getByText('Option2')).toBeInTheDocument();
      expect(screen.getByText('Option3')).toBeInTheDocument();
    });

    it('renders toggle buttons with IOptions', () => {
      const handleSelection = vi.fn();
      renderWithTheme(<PmxToggleButtonGroup options={iOptions} onChange={handleSelection} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('sets aria-label for each button with string options', () => {
      const handleSelection = vi.fn();
      renderWithTheme(<PmxToggleButtonGroup options={stringOptions} onChange={handleSelection} />);

      expect(screen.getByLabelText('Option1')).toBeInTheDocument();
      expect(screen.getByLabelText('Option2')).toBeInTheDocument();
      expect(screen.getByLabelText('Option3')).toBeInTheDocument();
    });

    it('sets aria-label for each button with IOptions', () => {
      const handleSelection = vi.fn();
      renderWithTheme(<PmxToggleButtonGroup options={iOptions} onChange={handleSelection} />);

      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
    });
  });

  describe('Default Selection', () => {
    it('defaults to the first option when defaultSelected is not provided with string options', () => {
      const handleSelection = vi.fn();
      renderWithTheme(<PmxToggleButtonGroup options={stringOptions} onChange={handleSelection} />);

      // The first button should be selected by default
      const firstButton = screen.getByText('Option1');
      expect(firstButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('defaults to the first option when defaultSelected is not provided with IOptions', () => {
      const handleSelection = vi.fn();
      renderWithTheme(<PmxToggleButtonGroup options={iOptions} onChange={handleSelection} />);

      // The first button should be selected by default
      const firstButton = screen.getByText('Option 1');
      expect(firstButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('defaults to the specified defaultSelected option with string', () => {
      const handleSelection = vi.fn();
      renderWithTheme(<PmxToggleButtonGroup options={stringOptions} onChange={handleSelection} value="Option2" />);

      const secondButton = screen.getByText('Option2');
      expect(secondButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('defaults to the specified defaultSelected option with IOptions', () => {
      const handleSelection = vi.fn();
      renderWithTheme(<PmxToggleButtonGroup options={iOptions} onChange={handleSelection} value={iOptions[1]} />);

      const secondButton = screen.getByText('Option 2');
      expect(secondButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Selection Behavior', () => {
    it('calls onChange with the selected value when a button is clicked with string options', async () => {
      const user = userEvent.setup();
      const handleSelection = vi.fn();
      renderWithTheme(<PmxToggleButtonGroup options={stringOptions} onChange={handleSelection} />);

      const secondButton = screen.getByText('Option2');
      await user.click(secondButton);

      expect(handleSelection).toHaveBeenCalledWith('Option2');
      expect(handleSelection).toHaveBeenCalledTimes(1);
    });

    it('calls onChange with the selected value when a button is clicked with IOptions', async () => {
      const user = userEvent.setup();
      const handleSelection = vi.fn();
      renderWithTheme(<PmxToggleButtonGroup options={iOptions} onChange={handleSelection} />);

      const secondButton = screen.getByText('Option 2');
      await user.click(secondButton);

      expect(handleSelection).toHaveBeenCalledWith('Option2');
      expect(handleSelection).toHaveBeenCalledTimes(1);
    });

    it('deselects when clicking the currently selected button', async () => {
      const user = userEvent.setup();
      const handleSelection = vi.fn();
      renderWithTheme(<PmxToggleButtonGroup options={stringOptions} onChange={handleSelection} />);

      const firstButton = screen.getByText('Option1');
      await user.click(firstButton); // Deselect

      expect(handleSelection).toHaveBeenCalledWith(null);
      expect(handleSelection).toHaveBeenCalledTimes(1);
    });

    it('allows only one selection at a time (exclusive)', async () => {
      const user = userEvent.setup();
      const handleSelection = vi.fn();
      renderWithTheme(<PmxToggleButtonGroup options={stringOptions} onChange={handleSelection} />);

      const secondButton = screen.getByText('Option2');
      const thirdButton = screen.getByText('Option3');

      await user.click(secondButton);
      expect(handleSelection).toHaveBeenCalledWith('Option2');

      await user.click(thirdButton);
      expect(handleSelection).toHaveBeenCalledWith('Option3');
      expect(handleSelection).toHaveBeenCalledTimes(2);

      // Check that only Option3 is selected
      expect(thirdButton).toHaveAttribute('aria-pressed', 'true');
      expect(secondButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Disabled State', () => {
    it('disables the buttons when disabled prop is true', () => {
      const handleSelection = vi.fn();
      renderWithTheme(<PmxToggleButtonGroup options={stringOptions} onChange={handleSelection} disabled />);

      const firstButton = screen.getByText('Option1');
      expect(firstButton).toBeDisabled();
    });
  });

  describe('minWidth Prop', () => {
    it('applies minWidth to toggle buttons', () => {
      const handleSelection = vi.fn();
      renderWithTheme(<PmxToggleButtonGroup options={stringOptions} onChange={handleSelection} minWidth={150} />);

      const firstButton = screen.getByText('Option1');
      expect(firstButton).toHaveStyle('min-width: 150px');
    });
  });

  describe('Empty Options', () => {
    it('renders no buttons when options array is empty', () => {
      const handleSelection = vi.fn();
      renderWithTheme(<PmxToggleButtonGroup options={[]} onChange={handleSelection} />);

      expect(screen.queryByText('Option1')).not.toBeInTheDocument();
    });
  });
});
