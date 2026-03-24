/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SyncCheckbox from '@features/equipment-manager/uas/components/SyncCheckbox';

// Test wrapper component that manages state
const SyncCheckboxWrapper = ({
  initialFieldSyncStatus = {},
  field = 'testField',
  label = 'Test Label',
  sx,
}: {
  initialFieldSyncStatus?: { [key: string]: boolean };
  field?: string;
  label?: string;
  sx?: any;
}) => {
  const [fieldSyncStatus, setFieldSyncStatus] = useState(initialFieldSyncStatus);

  return (
    <div>
      <SyncCheckbox
        field={field}
        label={label}
        fieldSyncStatus={fieldSyncStatus}
        setFieldSyncStatus={setFieldSyncStatus}
        sx={sx}
      />
      <div data-testid="sync-status">{JSON.stringify(fieldSyncStatus)}</div>
    </div>
  );
};

describe('SyncCheckbox', () => {
  describe('Rendering', () => {
    it('should render with label', () => {
      render(<SyncCheckboxWrapper />);

      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('should render checkbox', () => {
      render(<SyncCheckboxWrapper />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should render unchecked checkbox when field is false', () => {
      render(<SyncCheckboxWrapper initialFieldSyncStatus={{ testField: false }} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should render checked checkbox when field is true', () => {
      render(<SyncCheckboxWrapper initialFieldSyncStatus={{ testField: true }} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should apply custom sx styles', () => {
      const customSx = { marginTop: 2, color: 'primary.main' };
      const { container } = render(<SyncCheckboxWrapper sx={customSx} />);

      const formControlLabel = container.querySelector('.MuiFormControlLabel-root');
      expect(formControlLabel).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should update state when checkbox is clicked', async () => {
      const user = userEvent.setup();
      render(<SyncCheckboxWrapper initialFieldSyncStatus={{ testField: false }} />);

      const checkbox = screen.getByRole('checkbox');
      const statusDisplay = screen.getByTestId('sync-status');

      expect(checkbox).not.toBeChecked();
      expect(statusDisplay).toHaveTextContent('{"testField":false}');

      await act(async () => {
        await user.click(checkbox);
      });

      expect(checkbox).toBeChecked();
      expect(statusDisplay).toHaveTextContent('{"testField":true}');
    });

    it('should toggle from unchecked to checked', async () => {
      const user = userEvent.setup();
      render(<SyncCheckboxWrapper initialFieldSyncStatus={{ testField: false }} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await act(async () => {
        await user.click(checkbox);
      });

      expect(checkbox).toBeChecked();
    });

    it('should toggle from checked to unchecked', async () => {
      const user = userEvent.setup();
      render(<SyncCheckboxWrapper initialFieldSyncStatus={{ testField: true }} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();

      await act(async () => {
        await user.click(checkbox);
      });

      expect(checkbox).not.toBeChecked();
    });

    it('should preserve other fields when updating', async () => {
      const user = userEvent.setup();
      render(
        <SyncCheckboxWrapper
          initialFieldSyncStatus={{
            testField: false,
            otherField: true,
            anotherField: false,
          }}
        />,
      );

      const checkbox = screen.getByRole('checkbox');
      const statusDisplay = screen.getByTestId('sync-status');

      expect(statusDisplay).toHaveTextContent('{"testField":false,"otherField":true,"anotherField":false}');

      await act(async () => {
        await user.click(checkbox);
      });

      expect(statusDisplay).toHaveTextContent('{"testField":true,"otherField":true,"anotherField":false}');
    });

    it('should handle clicking the label', async () => {
      const user = userEvent.setup();
      render(<SyncCheckboxWrapper initialFieldSyncStatus={{ testField: false }} />);

      const label = screen.getByText('Test Label');
      const checkbox = screen.getByRole('checkbox');

      expect(checkbox).not.toBeChecked();

      await act(async () => {
        await user.click(label);
      });

      expect(checkbox).toBeChecked();
    });

    it('should handle multiple clicks', async () => {
      const user = userEvent.setup();
      render(<SyncCheckboxWrapper initialFieldSyncStatus={{ testField: false }} />);

      const checkbox = screen.getByRole('checkbox');

      expect(checkbox).not.toBeChecked();

      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox).toBeChecked();

      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox).not.toBeChecked();

      await act(async () => {
        await user.click(checkbox);
      });
      expect(checkbox).toBeChecked();
    });
  });

  describe('Different Field Names', () => {
    it('should handle serialNumber field', async () => {
      const user = userEvent.setup();
      render(
        <SyncCheckboxWrapper
          field="serialNumber"
          label="Serial Number"
          initialFieldSyncStatus={{ serialNumber: false }}
        />,
      );

      const checkbox = screen.getByRole('checkbox');
      const statusDisplay = screen.getByTestId('sync-status');

      expect(checkbox).not.toBeChecked();
      expect(statusDisplay).toHaveTextContent('{"serialNumber":false}');

      await act(async () => {
        await user.click(checkbox);
      });

      expect(checkbox).toBeChecked();
      expect(statusDisplay).toHaveTextContent('{"serialNumber":true}');
    });

    it('should handle ecd field', async () => {
      const user = userEvent.setup();
      render(<SyncCheckboxWrapper field="ecd" label="ECD" initialFieldSyncStatus={{ ecd: true }} />);

      const checkbox = screen.getByRole('checkbox');
      const statusDisplay = screen.getByTestId('sync-status');

      expect(checkbox).toBeChecked();
      expect(statusDisplay).toHaveTextContent('{"ecd":true}');

      await act(async () => {
        await user.click(checkbox);
      });

      expect(checkbox).not.toBeChecked();
      expect(statusDisplay).toHaveTextContent('{"ecd":false}');
    });

    it('should handle model field', async () => {
      const user = userEvent.setup();
      render(<SyncCheckboxWrapper field="model" label="Model" initialFieldSyncStatus={{ model: false }} />);

      const checkbox = screen.getByRole('checkbox');
      const statusDisplay = screen.getByTestId('sync-status');

      expect(checkbox).not.toBeChecked();
      expect(statusDisplay).toHaveTextContent('{"model":false}');

      await act(async () => {
        await user.click(checkbox);
      });

      expect(checkbox).toBeChecked();
      expect(statusDisplay).toHaveTextContent('{"model":true}');
    });
  });

  describe('Edge Cases', () => {
    it('should handle field not present in fieldSyncStatus', () => {
      render(<SyncCheckboxWrapper field="newField" label="New Field" initialFieldSyncStatus={{ otherField: true }} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should handle empty fieldSyncStatus object', () => {
      render(<SyncCheckboxWrapper initialFieldSyncStatus={{}} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should handle empty label', () => {
      render(<SyncCheckboxWrapper label="" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should handle special characters in field name', async () => {
      const user = userEvent.setup();
      render(
        <SyncCheckboxWrapper
          field="field-with-dashes"
          label="Field With Dashes"
          initialFieldSyncStatus={{ 'field-with-dashes': false }}
        />,
      );

      const checkbox = screen.getByRole('checkbox');
      const statusDisplay = screen.getByTestId('sync-status');

      expect(checkbox).not.toBeChecked();
      expect(statusDisplay).toHaveTextContent('{"field-with-dashes":false}');

      await act(async () => {
        await user.click(checkbox);
      });

      expect(checkbox).toBeChecked();
      expect(statusDisplay).toHaveTextContent('{"field-with-dashes":true}');
    });

    it('should add new field to empty object', async () => {
      const user = userEvent.setup();
      render(<SyncCheckboxWrapper initialFieldSyncStatus={{}} />);

      const checkbox = screen.getByRole('checkbox');
      const statusDisplay = screen.getByTestId('sync-status');

      expect(statusDisplay).toHaveTextContent('{}');

      await act(async () => {
        await user.click(checkbox);
      });

      expect(checkbox).toBeChecked();
      expect(statusDisplay).toHaveTextContent('{"testField":true}');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible checkbox role', () => {
      render(<SyncCheckboxWrapper />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should associate label with checkbox', () => {
      render(<SyncCheckboxWrapper />);

      const checkbox = screen.getByRole('checkbox', { name: 'Test Label' });
      expect(checkbox).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<SyncCheckboxWrapper initialFieldSyncStatus={{ testField: false }} />);

      const checkbox = screen.getByRole('checkbox');

      await act(async () => {
        checkbox.focus();
      });

      expect(checkbox).toHaveFocus();
      expect(checkbox).not.toBeChecked();

      await act(async () => {
        await user.keyboard(' ');
      });

      expect(checkbox).toBeChecked();
    });

    it('should support tab navigation', async () => {
      const user = userEvent.setup();
      render(
        <>
          <button>Before</button>
          <SyncCheckboxWrapper />
          <button>After</button>
        </>,
      );

      const beforeButton = screen.getByText('Before');
      const checkbox = screen.getByRole('checkbox');
      const afterButton = screen.getByText('After');

      await act(async () => {
        beforeButton.focus();
      });
      expect(beforeButton).toHaveFocus();

      await act(async () => {
        await user.tab();
      });
      expect(checkbox).toHaveFocus();

      await act(async () => {
        await user.tab();
      });
      expect(afterButton).toHaveFocus();
    });
  });

  describe('Multiple Instances', () => {
    it('should handle multiple checkboxes independently', async () => {
      const user = userEvent.setup();

      const MultipleCheckboxes = () => {
        const [fieldSyncStatus, setFieldSyncStatus] = useState<{ [sync: string]: boolean }>({
          field1: false,
          field2: true,
        });

        return (
          <div>
            <SyncCheckbox
              field="field1"
              label="Field 1"
              fieldSyncStatus={fieldSyncStatus}
              setFieldSyncStatus={setFieldSyncStatus}
            />
            <SyncCheckbox
              field="field2"
              label="Field 2"
              fieldSyncStatus={fieldSyncStatus}
              setFieldSyncStatus={setFieldSyncStatus}
            />
            <div data-testid="sync-status">{JSON.stringify(fieldSyncStatus)}</div>
          </div>
        );
      };

      render(<MultipleCheckboxes />);

      const checkbox1 = screen.getByRole('checkbox', { name: 'Field 1' });
      const checkbox2 = screen.getByRole('checkbox', { name: 'Field 2' });
      const statusDisplay = screen.getByTestId('sync-status');

      expect(checkbox1).not.toBeChecked();
      expect(checkbox2).toBeChecked();
      expect(statusDisplay).toHaveTextContent('{"field1":false,"field2":true}');

      await act(async () => {
        await user.click(checkbox1);
      });

      expect(checkbox1).toBeChecked();
      expect(checkbox2).toBeChecked();
      expect(statusDisplay).toHaveTextContent('{"field1":true,"field2":true}');

      await act(async () => {
        await user.click(checkbox2);
      });

      expect(checkbox1).toBeChecked();
      expect(checkbox2).not.toBeChecked();
      expect(statusDisplay).toHaveTextContent('{"field1":true,"field2":false}');
    });
  });

  describe('Component Props', () => {
    it('should accept all required props', () => {
      const { container } = render(<SyncCheckboxWrapper />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept optional sx prop', () => {
      const { container } = render(<SyncCheckboxWrapper sx={{ padding: 2 }} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
