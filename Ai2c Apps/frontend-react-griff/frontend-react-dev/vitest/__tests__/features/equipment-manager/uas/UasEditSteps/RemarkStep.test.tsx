import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MultiStepProvider, RemarkStep } from '@features/equipment-manager/uas/UasEditSteps';

// Simple wrapper with context provider
const RemarkStepWrapper = () => {
  return (
    <MultiStepProvider>
      <RemarkStep />
    </MultiStepProvider>
  );
};

describe('RemarkStep', () => {
  describe('Rendering', () => {
    it('should render the component', () => {
      render(<RemarkStepWrapper />);

      expect(screen.getByText('Edit UAVs airframe hours.')).toBeInTheDocument();
    });

    it('should render the description text', () => {
      render(<RemarkStepWrapper />);

      const description = screen.getByText('Edit UAVs airframe hours.');
      expect(description).toBeInTheDocument();
    });

    it('should render the Remarks text field', () => {
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks');
      expect(textField).toBeInTheDocument();
    });

    it('should render the Remarks text field with correct test id', () => {
      render(<RemarkStepWrapper />);

      const textField = screen.getByTestId('uas-multi-edit-remarks');
      expect(textField).toBeInTheDocument();
    });

    it('should render multiline text field', () => {
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;
      expect(textField.tagName).toBe('TEXTAREA');
    });

    it('should render the SyncCheckbox component', () => {
      render(<RemarkStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' });
      expect(checkbox).toBeInTheDocument();
    });

    it('should render the Auto-sync data label', () => {
      render(<RemarkStepWrapper />);

      expect(screen.getByText('Auto-sync data')).toBeInTheDocument();
    });

    it('should render with Stack layout', () => {
      const { container } = render(<RemarkStepWrapper />);

      const stack = container.querySelector('.MuiStack-root');
      expect(stack).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    it('should display empty remarks by default', () => {
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;
      expect(textField.value).toBe('');
    });

    it('should display sync checkbox with initial state from context', () => {
      render(<RemarkStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' }) as HTMLInputElement;
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should update remarks when text field value changes', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;

      await act(async () => {
        await user.type(textField, 'Test remark');
      });

      expect(textField.value).toBe('Test remark');
    });

    it('should handle single line text input', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;

      await act(async () => {
        await user.type(textField, 'Single line remark');
      });

      expect(textField.value).toBe('Single line remark');
    });

    it('should handle multiline text input', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;

      await act(async () => {
        await user.type(textField, 'Line 1{Enter}Line 2{Enter}Line 3');
      });

      expect(textField.value).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should handle long text input', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;
      const longText =
        'This is a very long remark that spans multiple lines and contains a lot of text to test the textarea behavior.';

      await act(async () => {
        await user.type(textField, longText);
      });

      expect(textField.value).toBe(longText);
    });

    it('should handle clearing the text field', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;

      await act(async () => {
        await user.type(textField, 'Test remark');
      });
      expect(textField.value).toBe('Test remark');

      await act(async () => {
        await user.clear(textField);
      });

      expect(textField.value).toBe('');
    });

    it('should toggle sync checkbox when clicked', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' }) as HTMLInputElement;
      const initialState = checkbox.checked;

      await act(async () => {
        await user.click(checkbox);
      });

      expect(checkbox.checked).toBe(!initialState);
    });

    it('should toggle checkbox multiple times', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

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

    it('should handle multiple text field changes', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;

      await act(async () => {
        await user.type(textField, 'First remark');
      });
      expect(textField.value).toBe('First remark');

      await act(async () => {
        await user.clear(textField);
      });
      expect(textField.value).toBe('');

      await act(async () => {
        await user.type(textField, 'Second remark');
      });
      expect(textField.value).toBe('Second remark');
    });
  });

  describe('TextField Properties', () => {
    it('should have correct id attribute', () => {
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks');
      expect(textField).toHaveAttribute('id', 'uas-multi-edit-hours-remarks');
    });

    it('should have small size', () => {
      const { container } = render(<RemarkStepWrapper />);

      const textField = container.querySelector('.MuiInputBase-sizeSmall');
      expect(textField).toBeInTheDocument();
    });

    it('should have correct label', () => {
      render(<RemarkStepWrapper />);

      expect(screen.getByLabelText('Remarks')).toBeInTheDocument();
    });

    it('should be multiline', () => {
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;
      expect(textField.tagName).toBe('TEXTAREA');
    });

    it('should have 3 rows', () => {
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;
      expect(textField.rows).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;

      await act(async () => {
        await user.type(textField, '!@#$%^&*()');
      });

      expect(textField.value).toBe('!@#$%^&*()');
    });

    it('should handle numbers in remarks', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;

      await act(async () => {
        await user.type(textField, '12345');
      });

      expect(textField.value).toBe('12345');
    });

    it('should handle mixed alphanumeric input', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;

      await act(async () => {
        await user.type(textField, 'Remark123 with numbers');
      });

      expect(textField.value).toBe('Remark123 with numbers');
    });

    it('should handle tabs and spaces', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;

      await act(async () => {
        await user.type(textField, 'Text with    spaces');
      });

      expect(textField.value).toBe('Text with    spaces');
    });
  });

  describe('Combined Interactions', () => {
    it('should handle both text field and checkbox changes', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;
      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' }) as HTMLInputElement;

      // Type in text field
      await act(async () => {
        await user.type(textField, 'Test remark');
      });
      expect(textField.value).toBe('Test remark');

      // Store initial checkbox state
      const initialCheckboxState = checkbox.checked;

      // Click checkbox
      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox.checked).toBe(!initialCheckboxState);

      // Update text field again
      await act(async () => {
        await user.clear(textField);
        await user.type(textField, 'Updated remark');
      });
      expect(textField.value).toBe('Updated remark');

      // Checkbox state should remain unchanged
      expect(checkbox.checked).toBe(!initialCheckboxState);
    });

    it('should maintain independent state for text and checkbox', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;
      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' }) as HTMLInputElement;

      // Type in text field
      await act(async () => {
        await user.type(textField, 'Initial remark');
      });
      expect(textField.value).toBe('Initial remark');

      // Store initial checkbox state
      const initialCheckboxState = checkbox.checked;

      // Toggle checkbox
      await act(async () => {
        await user.click(checkbox);
      });
      const newCheckboxState = checkbox.checked;
      expect(newCheckboxState).toBe(!initialCheckboxState);

      // Clear text field
      await act(async () => {
        await user.clear(textField);
      });
      expect(textField.value).toBe('');
      expect(checkbox.checked).toBe(newCheckboxState); // Checkbox should remain in toggled state

      // Toggle checkbox again
      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox.checked).toBe(initialCheckboxState);
      expect(textField.value).toBe(''); // Text should remain empty
    });

    it('should handle multiline text with checkbox interaction', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;
      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' }) as HTMLInputElement;

      // Type multiline text
      await act(async () => {
        await user.type(textField, 'Line 1{Enter}Line 2{Enter}Line 3');
      });
      expect(textField.value).toBe('Line 1\nLine 2\nLine 3');

      // Toggle checkbox
      await act(async () => {
        await user.click(checkbox);
      });

      // Text should remain unchanged
      expect(textField.value).toBe('Line 1\nLine 2\nLine 3');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible text field', () => {
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks');
      expect(textField).toBeInTheDocument();
      expect(textField).toHaveAccessibleName('Remarks');
    });

    it('should have accessible checkbox', () => {
      render(<RemarkStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAccessibleName('Auto-sync data');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks');
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
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;

      await act(async () => {
        textField.focus();
        await user.keyboard('Keyboard input');
      });

      expect(textField.value).toBe('Keyboard input');
    });

    it('should support space key for checkbox', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Auto-sync data' }) as HTMLInputElement;
      const initialState = checkbox.checked;

      await act(async () => {
        checkbox.focus();
        await user.keyboard(' ');
      });

      expect(checkbox.checked).toBe(!initialState);
    });

    it('should support Enter key in multiline text field', async () => {
      const user = userEvent.setup();
      render(<RemarkStepWrapper />);

      const textField = screen.getByLabelText('Remarks') as HTMLTextAreaElement;

      await act(async () => {
        textField.focus();
        await user.keyboard('First line{Enter}Second line');
      });

      expect(textField.value).toBe('First line\nSecond line');
    });
  });

  describe('Layout and Styling', () => {
    it('should render components in vertical stack', () => {
      const { container } = render(<RemarkStepWrapper />);

      const stack = container.querySelector('.MuiStack-root');
      expect(stack).toBeInTheDocument();
    });

    it('should have proper spacing between elements', () => {
      const { container } = render(<RemarkStepWrapper />);

      const stack = container.querySelector('.MuiStack-root');
      expect(stack).toBeInTheDocument();
    });

    it('should have full width text field', () => {
      const { container } = render(<RemarkStepWrapper />);

      const textField = container.querySelector('#uas-multi-edit-hours-remarks');
      expect(textField).toBeInTheDocument();
    });
  });
});
