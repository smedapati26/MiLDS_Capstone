import { describe, expect, it, vi } from 'vitest';
import z from 'zod';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RHFFilterFormProvider } from '@components/react-hook-form/RHFFilterFormProvider';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

const testSchema = z.object({
  testField: z.string(),
});

const defaultValues = { testField: 'default' };

const mockChildren = <div data-testid="filter-children">Test Filter UI</div>;

describe('RHFFilterFormProvider', () => {
  describe('Basic Rendering', () => {
    it('renders the IconButton with FilterList icon', () => {
      renderWithProviders(
        <RHFFilterFormProvider title="Test Filter" schema={testSchema} defaultValues={defaultValues}>
          {mockChildren}
        </RHFFilterFormProvider>,
      );

      const iconButton = screen.getByRole('button', { name: 'Test Filter open button' });
      expect(iconButton).toBeInTheDocument();
      expect(iconButton).toContainElement(screen.getByTestId('FilterListIcon')); // Assuming FilterListIcon has testid or check visually
    });

    it('popover is closed initially', () => {
      renderWithProviders(
        <RHFFilterFormProvider title="Test Filter" schema={testSchema} defaultValues={defaultValues}>
          {mockChildren}
        </RHFFilterFormProvider>,
      );

      expect(screen.queryByText('Test Filter')).not.toBeInTheDocument(); // Title not visible when closed
    });
  });

  describe('Opening Popover', () => {
    it('opens popover when IconButton is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <RHFFilterFormProvider title="Test Filter" schema={testSchema} defaultValues={defaultValues}>
          {mockChildren}
        </RHFFilterFormProvider>,
      );

      const iconButton = screen.getByRole('button', { name: 'Test Filter open button' });
      await user.click(iconButton);

      expect(screen.getByText('Test Filter')).toBeInTheDocument();
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
      expect(screen.getByTestId('filter-children')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
    });
  });

  describe('Closing Popover', () => {
    it('closes popover when Cancel button is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <RHFFilterFormProvider title="Test Filter" schema={testSchema} defaultValues={defaultValues}>
          {mockChildren}
        </RHFFilterFormProvider>,
      );

      const iconButton = screen.getByRole('button', { name: 'Test Filter open button' });
      await user.click(iconButton);

      expect(screen.getByText('Test Filter')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(screen.queryByText('Test Filter')).not.toBeInTheDocument();
    });
  });

  describe('Apply Filters', () => {
    it('calls onApplyFilters with form values and closes popover when Apply is clicked', async () => {
      const user = userEvent.setup();
      const mockOnApply = vi.fn();

      renderWithProviders(
        <RHFFilterFormProvider
          title="Test Filter"
          schema={testSchema}
          defaultValues={defaultValues}
          onSubmitFilters={mockOnApply}
        >
          {mockChildren}
        </RHFFilterFormProvider>,
      );

      const iconButton = screen.getByRole('button', { name: 'Test Filter open button' });
      await user.click(iconButton);

      const applyButton = screen.getByRole('button', { name: 'Apply' });
      await user.click(applyButton);

      expect(mockOnApply).toHaveBeenCalledWith(defaultValues);
      expect(screen.queryByText('Test Filter')).not.toBeInTheDocument();
    });
  });

  describe('Clear Filters', () => {
    it('calls onClearFilters when provided and Clear Filters is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClear = vi.fn();

      renderWithProviders(
        <RHFFilterFormProvider
          title="Test Filter"
          schema={testSchema}
          defaultValues={defaultValues}
          onClearFilters={mockOnClear}
        >
          {mockChildren}
        </RHFFilterFormProvider>,
      );

      const iconButton = screen.getByRole('button', { name: 'Test Filter open button' });
      await user.click(iconButton);

      const clearLink = screen.getByText('Clear Filters');
      await user.click(clearLink);

      expect(mockOnClear).toHaveBeenCalled();
      // Popover should still be open
      expect(screen.getByText('Test Filter')).toBeInTheDocument();
    });

    it('resets form and applies filters when onClearFilters is not provided', async () => {
      const user = userEvent.setup();
      const mockOnApply = vi.fn();

      renderWithProviders(
        <RHFFilterFormProvider
          title="Test Filter"
          schema={testSchema}
          defaultValues={defaultValues}
          onSubmitFilters={mockOnApply}
        >
          {mockChildren}
        </RHFFilterFormProvider>,
      );

      const iconButton = screen.getByRole('button', { name: 'Test Filter open button' });
      await user.click(iconButton);

      const clearLink = screen.getByText('Clear Filters');
      await user.click(clearLink);

      // Should call onApplyFilters with reset values (defaultValues)
      expect(mockOnApply).toHaveBeenCalledWith(defaultValues);
      expect(screen.queryByText('Test Filter')).not.toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('displays the correct title', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <RHFFilterFormProvider title="Custom Title" schema={testSchema} defaultValues={defaultValues}>
          {mockChildren}
        </RHFFilterFormProvider>,
      );

      const iconButton = screen.getByRole('button', { name: 'Custom Title open button' });
      await user.click(iconButton);

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders children inside the popover', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <RHFFilterFormProvider title="Test Filter" schema={testSchema} defaultValues={defaultValues}>
          {mockChildren}
        </RHFFilterFormProvider>,
      );

      const iconButton = screen.getByRole('button', { name: 'Test Filter open button' });
      await user.click(iconButton);

      expect(screen.getByTestId('filter-children')).toBeInTheDocument();
    });
  });
  
  describe('Disabled Button', () => {
    it('IconButton is disabled when disabled prop passed to form provider', async () => {
      renderWithProviders(
        <RHFFilterFormProvider title="Test Filter" schema={testSchema} defaultValues={defaultValues} disabled={true}>
          {mockChildren}
        </RHFFilterFormProvider>,
      );

      const iconButton = screen.getByRole('button', { name: 'Test Filter open button' });
      expect(iconButton).toBeInTheDocument();
      expect(iconButton).toBeDisabled();
    });
  });
});
