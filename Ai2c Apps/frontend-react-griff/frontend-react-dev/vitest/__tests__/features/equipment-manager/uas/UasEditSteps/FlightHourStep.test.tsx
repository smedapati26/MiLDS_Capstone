import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FlightHourStep, MultiStepProvider } from '@features/equipment-manager/uas/UasEditSteps';

// Simple wrapper with context provider
const FlightHourStepWrapper = () => {
  return (
    <MultiStepProvider>
      <FlightHourStep />
    </MultiStepProvider>
  );
};

describe('FlightHourStep', () => {
  describe('Rendering', () => {
    it('should render the component', () => {
      render(<FlightHourStepWrapper />);

      expect(screen.getByText('Edit UAVs airframe hours.')).toBeInTheDocument();
    });

    it('should render the description text', () => {
      render(<FlightHourStepWrapper />);

      const description = screen.getByText('Edit UAVs airframe hours.');
      expect(description).toBeInTheDocument();
    });

    it('should render the Period Hours text field', () => {
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours');
      expect(textField).toBeInTheDocument();
    });

    it('should render the Period Hours text field with correct test id', () => {
      render(<FlightHourStepWrapper />);

      const textField = screen.getByTestId('uas-multi-edit-hours-flown');
      expect(textField).toBeInTheDocument();
    });

    it('should render the SyncCheckbox component', () => {
      render(<FlightHourStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' });
      expect(checkbox).toBeInTheDocument();
    });

    it('should render the Auto-sync data label', () => {
      render(<FlightHourStepWrapper />);

      expect(screen.getByText('Auto-sync data')).toBeInTheDocument();
    });

    it('should render with Stack layout', () => {
      const { container } = render(<FlightHourStepWrapper />);

      const stack = container.querySelector('.MuiStack-root');
      expect(stack).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    it('should display empty flight hours by default', () => {
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours') as HTMLInputElement;
      expect(textField.value).toBe('0');
    });

    it('should display unchecked sync checkbox by default', () => {
      render(<FlightHourStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' });
      expect(checkbox).toBeChecked();
    });
  });

  describe('User Interactions', () => {
    it('should update flight hours when text field value changes', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours') as HTMLInputElement;

      await act(async () => {
        await user.type(textField, '100');
      });

      expect(textField.value).toBe('0100');
    });

    it('should handle numeric input', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours') as HTMLInputElement;

      await act(async () => {
        await user.type(textField, '250');
      });

      expect(textField.value).toBe('0250');
    });

    it('should handle decimal input', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours') as HTMLInputElement;

      await act(async () => {
        await user.type(textField, '123.5');
      });

      expect(textField.value).toBe('0123.5');
    });

    it('should handle clearing the text field', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours') as HTMLInputElement;

      await act(async () => {
        await user.type(textField, '100');
      });
      expect(textField.value).toBe('0100');

      await act(async () => {
        await user.clear(textField);
      });

      expect(textField.value).toBe('');
    });

    it('should update sync status when checkbox is clicked', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' });

      expect(checkbox).toBeChecked();

      await act(async () => {
        await user.click(checkbox);
      });

      expect(checkbox).not.toBeChecked();
    });

    it('should toggle checkbox from checked to checked', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' });

      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox).not.toBeChecked();

      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox).toBeChecked();
    });

    it('should handle multiple text field changes', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours') as HTMLInputElement;

      await act(async () => {
        await user.type(textField, '10');
      });
      expect(textField.value).toBe('010');

      await act(async () => {
        await user.clear(textField);
      });
      expect(textField.value).toBe('');

      await act(async () => {
        await user.type(textField, '20');
      });
      expect(textField.value).toBe('20');
    });

    it('should handle multiple checkbox toggles', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' });

      expect(checkbox).toBeChecked();

      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox).not.toBeChecked();

      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox).toBeChecked();

      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('TextField Properties', () => {
    it('should have correct id attribute', () => {
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours');
      expect(textField).toHaveAttribute('id', 'uas-multi-edit-hours-flown');
    });

    it('should have small size', () => {
      const { container } = render(<FlightHourStepWrapper />);

      const textField = container.querySelector('.MuiInputBase-sizeSmall');
      expect(textField).toBeInTheDocument();
    });

    it('should have correct label', () => {
      render(<FlightHourStepWrapper />);

      expect(screen.getByLabelText('Period Hours')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero flight hours', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours') as HTMLInputElement;

      await act(async () => {
        await user.type(textField, '0');
      });

      expect(textField.value).toBe('00');
    });

    it('should handle large flight hours', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours') as HTMLInputElement;

      await act(async () => {
        await user.type(textField, '99999');
      });

      expect(textField.value).toBe('099999');
    });

    it('should handle negative flight hours input', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours') as HTMLInputElement;

      await act(async () => {
        await user.type(textField, '-50');
      });

      expect(textField.value).toBe('0-50');
    });

    it('should handle non-numeric input', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours') as HTMLInputElement;

      await act(async () => {
        await user.type(textField, 'abc');
      });

      expect(textField.value).toBe('0abc');
    });
  });

  describe('Combined Interactions', () => {
    it('should handle both text field and checkbox changes', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours') as HTMLInputElement;
      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' });

      // Type in text field
      await act(async () => {
        await user.type(textField, '100');
      });
      expect(textField.value).toBe('0100');

      // Click checkbox
      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox).not.toBeChecked();

      // Update text field again
      await act(async () => {
        await user.clear(textField);
        await user.type(textField, '200');
      });
      expect(textField.value).toBe('200');

      // Checkbox should still be checked
      expect(checkbox).not.toBeChecked();
    });

    it('should maintain independent state for text and checkbox', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours') as HTMLInputElement;
      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' });

      // Type in text field
      await act(async () => {
        await user.type(textField, '50');
      });
      expect(textField.value).toBe('050');

      // Check checkbox
      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox).not.toBeChecked();

      // Clear text field
      await act(async () => {
        await user.clear(textField);
      });
      expect(textField.value).toBe('');
      expect(checkbox).not.toBeChecked(); // Checkbox should remain unchecked

      // Uncheck checkbox
      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox).toBeChecked();
      expect(textField.value).toBe(''); // Text should remain empty
    });
  });

  describe('Accessibility', () => {
    it('should have accessible text field', () => {
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours');
      expect(textField).toBeInTheDocument();
      expect(textField).toHaveAccessibleName('Period Hours');
    });

    it('should have accessible checkbox', () => {
      render(<FlightHourStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAccessibleName('Auto-sync data');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours');
      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' });

      await act(async () => {
        textField.focus();
      });
      expect(textField).toHaveFocus();

      await act(async () => {
        await user.tab();
      });
      expect(checkbox).toHaveFocus();
    });

    it('should support keyboard input in text field', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const textField = screen.getByLabelText('Period Hours') as HTMLInputElement;

      await act(async () => {
        textField.focus();
        await user.keyboard('123');
      });

      expect(textField.value).toBe('0123');
    });

    it('should support space key for checkbox', async () => {
      const user = userEvent.setup();
      render(<FlightHourStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' });

      await act(async () => {
        checkbox.focus();
        await user.keyboard(' ');
      });

      expect(checkbox).not.toBeChecked();
    });
  });
});
