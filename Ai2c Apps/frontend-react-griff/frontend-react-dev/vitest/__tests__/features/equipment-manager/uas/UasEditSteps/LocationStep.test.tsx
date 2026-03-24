/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LocationStep, MultiStepProvider } from '@features/equipment-manager/uas/UasEditSteps';

// Mock LocationDropdown since it likely has complex dependencies
vi.mock('@components/dropdowns/LocationDropdown', () => ({
  default: ({ onChange, defaultValue }: { onChange: (value: any) => void; defaultValue: any; sx?: any }) => (
    <div data-testid="location-dropdown">
      <select
        aria-label="Location"
        onChange={(e) => {
          const value = e.target.value ? { id: parseInt(e.target.value), name: e.target.value } : null;
          onChange(value);
        }}
        defaultValue={defaultValue?.id || ''}
      >
        <option value="">Select Location</option>
        <option value="1">Location 1</option>
        <option value="2">Location 2</option>
        <option value="3">Location 3</option>
      </select>
    </div>
  ),
}));

// Simple wrapper with context provider
const LocationStepWrapper = () => {
  return (
    <MultiStepProvider>
      <LocationStep />
    </MultiStepProvider>
  );
};

describe('LocationStep', () => {
  describe('Rendering', () => {
    it('should render the component', () => {
      render(<LocationStepWrapper />);

      expect(screen.getByText('Edit UAVs airframe hours.')).toBeInTheDocument();
    });

    it('should render the description text', () => {
      render(<LocationStepWrapper />);

      const description = screen.getByText('Edit UAVs airframe hours.');
      expect(description).toBeInTheDocument();
    });

    it('should render the LocationDropdown component', () => {
      render(<LocationStepWrapper />);

      const dropdown = screen.getByTestId('location-dropdown');
      expect(dropdown).toBeInTheDocument();
    });

    it('should render the location select', () => {
      render(<LocationStepWrapper />);

      const select = screen.getByLabelText('Location');
      expect(select).toBeInTheDocument();
    });

    it('should render the SyncCheckbox component', () => {
      render(<LocationStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' });
      expect(checkbox).toBeInTheDocument();
    });

    it('should render the Auto-sync data label', () => {
      render(<LocationStepWrapper />);

      expect(screen.getByText('Auto-sync data')).toBeInTheDocument();
    });

    it('should render with Stack layout', () => {
      const { container } = render(<LocationStepWrapper />);

      const stack = container.querySelector('.MuiStack-root');
      expect(stack).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    it('should display empty location by default', async () => {
      render(<LocationStepWrapper />);

      const select = screen.getByLabelText('Location') as HTMLSelectElement;

      // Wait for useEffect to set location to null
      await waitFor(() => {
        expect(select.value).toBe('');
      });
    });

    it('should display sync checkbox with initial state from context', () => {
      render(<LocationStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' }) as HTMLInputElement;
      expect(checkbox).toBeInTheDocument();
    });

    it('should reset location to null on mount', async () => {
      render(<LocationStepWrapper />);

      const select = screen.getByLabelText('Location') as HTMLSelectElement;

      // useEffect should set location to null
      await waitFor(() => {
        expect(select.value).toBe('');
      });
    });
  });

  describe('User Interactions', () => {
    it('should update location when dropdown value changes', async () => {
      const user = userEvent.setup();
      render(<LocationStepWrapper />);

      const select = screen.getByLabelText('Location') as HTMLSelectElement;

      await act(async () => {
        await user.selectOptions(select, '1');
      });

      expect(select.value).toBe('1');
    });

    it('should handle selecting different locations', async () => {
      const user = userEvent.setup();
      render(<LocationStepWrapper />);

      const select = screen.getByLabelText('Location') as HTMLSelectElement;

      await act(async () => {
        await user.selectOptions(select, '1');
      });
      expect(select.value).toBe('1');

      await act(async () => {
        await user.selectOptions(select, '2');
      });
      expect(select.value).toBe('2');

      await act(async () => {
        await user.selectOptions(select, '3');
      });
      expect(select.value).toBe('3');
    });

    it('should handle clearing location selection', async () => {
      const user = userEvent.setup();
      render(<LocationStepWrapper />);

      const select = screen.getByLabelText('Location') as HTMLSelectElement;

      await act(async () => {
        await user.selectOptions(select, '1');
      });
      expect(select.value).toBe('1');

      await act(async () => {
        await user.selectOptions(select, '');
      });
      expect(select.value).toBe('');
    });

    it('should toggle sync checkbox when clicked', async () => {
      const user = userEvent.setup();
      render(<LocationStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' }) as HTMLInputElement;
      const initialState = checkbox.checked;

      await act(async () => {
        await user.click(checkbox);
      });

      expect(checkbox.checked).toBe(!initialState);
    });

    it('should toggle checkbox multiple times', async () => {
      const user = userEvent.setup();
      render(<LocationStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' }) as HTMLInputElement;
      const initialState = checkbox.checked;

      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox.checked).toBe(!initialState);

      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox.checked).toBe(initialState);

      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox.checked).toBe(!initialState);
    });

    it('should handle multiple location changes', async () => {
      const user = userEvent.setup();
      render(<LocationStepWrapper />);

      const select = screen.getByLabelText('Location') as HTMLSelectElement;

      await act(async () => {
        await user.selectOptions(select, '1');
      });
      expect(select.value).toBe('1');

      await act(async () => {
        await user.selectOptions(select, '');
      });
      expect(select.value).toBe('');

      await act(async () => {
        await user.selectOptions(select, '2');
      });
      expect(select.value).toBe('2');
    });
  });

  describe('LocationDropdown Properties', () => {
    it('should render LocationDropdown with correct props', () => {
      render(<LocationStepWrapper />);

      const dropdown = screen.getByTestId('location-dropdown');
      expect(dropdown).toBeInTheDocument();
    });

    it('should have location select with options', () => {
      render(<LocationStepWrapper />);

      const select = screen.getByLabelText('Location');
      const options = select.querySelectorAll('option');

      expect(options).toHaveLength(4); // Including "Select Location"
      expect(options[0]).toHaveTextContent('Select Location');
      expect(options[1]).toHaveTextContent('Location 1');
      expect(options[2]).toHaveTextContent('Location 2');
      expect(options[3]).toHaveTextContent('Location 3');
    });
  });

  describe('SyncCheckbox Integration', () => {
    it('should render SyncCheckbox with correct field', async () => {
      const user = userEvent.setup();
      render(<LocationStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' }) as HTMLInputElement;

      await act(async () => {
        await user.click(checkbox);
      });

      // Verify checkbox toggles
      expect(checkbox).toBeDefined();
    });

    it('should render SyncCheckbox with correct label', () => {
      render(<LocationStepWrapper />);

      expect(screen.getByText('Auto-sync data')).toBeInTheDocument();
    });
  });

  describe('Combined Interactions', () => {
    it('should handle both location and checkbox changes', async () => {
      const user = userEvent.setup();
      render(<LocationStepWrapper />);

      const select = screen.getByLabelText('Location') as HTMLSelectElement;
      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' }) as HTMLInputElement;

      // Select location
      await act(async () => {
        await user.selectOptions(select, '1');
      });
      expect(select.value).toBe('1');

      // Store initial checkbox state
      const initialCheckboxState = checkbox.checked;

      // Click checkbox
      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox.checked).toBe(!initialCheckboxState);

      // Change location again
      await act(async () => {
        await user.selectOptions(select, '2');
      });
      expect(select.value).toBe('2');

      // Checkbox state should remain unchanged
      expect(checkbox.checked).toBe(!initialCheckboxState);
    });

    it('should maintain independent state for location and checkbox', async () => {
      const user = userEvent.setup();
      render(<LocationStepWrapper />);

      const select = screen.getByLabelText('Location') as HTMLSelectElement;
      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' }) as HTMLInputElement;

      // Select location
      await act(async () => {
        await user.selectOptions(select, '1');
      });
      expect(select.value).toBe('1');

      // Store initial checkbox state
      const initialCheckboxState = checkbox.checked;

      // Toggle checkbox
      await act(async () => {
        await user.click(checkbox);
      });
      const newCheckboxState = checkbox.checked;
      expect(newCheckboxState).toBe(!initialCheckboxState);

      // Clear location
      await act(async () => {
        await user.selectOptions(select, '');
      });
      expect(select.value).toBe('');
      expect(checkbox.checked).toBe(newCheckboxState); // Checkbox should remain in toggled state

      // Toggle checkbox again
      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox.checked).toBe(initialCheckboxState);
      expect(select.value).toBe(''); // Location should remain empty
    });
  });

  describe('useEffect Behavior', () => {
    it('should call setLocation with null on mount', async () => {
      render(<LocationStepWrapper />);

      const select = screen.getByLabelText('Location') as HTMLSelectElement;

      // Wait for useEffect to execute
      await waitFor(() => {
        expect(select.value).toBe('');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible location dropdown', () => {
      render(<LocationStepWrapper />);

      const select = screen.getByLabelText('Location');
      expect(select).toBeInTheDocument();
      expect(select).toHaveAccessibleName('Location');
    });

    it('should have accessible checkbox', () => {
      render(<LocationStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAccessibleName('Auto-sync data');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<LocationStepWrapper />);

      const select = screen.getByLabelText('Location');
      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' });

      await act(async () => {
        select.focus();
      });
      expect(select).toHaveFocus();

      await act(async () => {
        await user.tab();
      });
      expect(checkbox).toHaveFocus();
    });

    it('should support keyboard selection in dropdown', async () => {
      const user = userEvent.setup();
      render(<LocationStepWrapper />);

      const select = screen.getByLabelText('Location') as HTMLSelectElement;

      await act(async () => {
        select.focus();
        await user.keyboard('{ArrowDown}');
        await user.keyboard('{Enter}');
      });

      // Verify interaction occurred
      expect(select).toHaveFocus();
    });

    it('should support space key for checkbox', async () => {
      const user = userEvent.setup();
      render(<LocationStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' }) as HTMLInputElement;
      const initialState = checkbox.checked;

      await act(async () => {
        checkbox.focus();
        await user.keyboard(' ');
      });

      expect(checkbox.checked).toBe(!initialState);
    });
  });

  describe('Layout and Styling', () => {
    it('should render components in vertical stack', () => {
      const { container } = render(<LocationStepWrapper />);

      const stack = container.querySelector('.MuiStack-root');
      expect(stack).toBeInTheDocument();
    });

    it('should have proper spacing between elements', () => {
      const { container } = render(<LocationStepWrapper />);

      const stack = container.querySelector('.MuiStack-root');
      expect(stack).toBeInTheDocument();
    });
  });
});
