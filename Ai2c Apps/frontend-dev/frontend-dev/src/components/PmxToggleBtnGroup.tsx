import React, { ReactNode } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import { styled, ToggleButton, ToggleButtonGroup } from '@mui/material';

/**
 * Props for the PmxToggleBtnGroup component.
 */
interface PmxToggleBtnGroupProps {
  /**
   * Array of button objects, each containing a `value`, `label`, and optional `disabled` property.
   */
  buttons: {
    value: string;
    label: string;
    disabled?: boolean;
    btnIcon?: ReactNode;
  }[];
  /**
   * The currently selected value(s).
   * A string for single selection or an array of strings for multiple selection.
   */
  selected: string | string[];
  /**
   * Callback function triggered when the selected value(s) change.
   * Receives either a string or an array of strings depending on `multiple`.
   */
  onChange: (val: string | string[]) => void;
  /**
   * Orientation of the button group (`horizontal` or `vertical`).
   * Default is `horizontal`.
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Size of the buttons (`small`, `medium`, or `large`).
   * Default is `medium`.
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether the button group should take up the full width of its container.
   * Default is `false`.
   */
  fullWidth?: boolean;
  /**
   * If true, allows multiple buttons to be selected at the same time.
   * Default is `false`.
   */
  multiple?: boolean;
  /**
   * If true, allows spacing between toggle buttons.
   * Default is `false`.
   */
  hasSpacing?: boolean;
  /**
   * If true, displayed toggled checkmark icons.
   * Default is `false`.
   */
  hasIcons?: boolean;
}

/**
 * A custom toggle button group component that supports single or multiple selections.
 *
 * @param buttons - Array of buttons with `value`, `label`, and optional `disabled` property.
 * @param selected - The currently selected value(s).
 * @param onChange - Function called when the selection changes.
 * @param orientation - Button group orientation (`horizontal` or `vertical`).
 * @param size - Size of the buttons (`small`, `medium`, or `large`).
 * @param fullWidth - Whether the button group spans the full width.
 * @param multiple - If true, enables multiple button selections.
 */
const PmxToggleBtnGroup: React.FC<PmxToggleBtnGroupProps> = ({
  buttons,
  selected,
  onChange,
  orientation = 'horizontal',
  size = 'medium',
  fullWidth = false,
  multiple = false,
  hasSpacing = false,
  hasIcons = false,
}) => {
  const StyledToggleButtonGroup = styled(ToggleButtonGroup)(() => ({
    gap: '1rem',
    '& .MuiToggleButton-root:not(:first-of-type)': {
      borderLeft: `1px solid`,
      borderRadius: '8px',
    },
    '& .MuiToggleButton-root': {
      textTransform: 'none',
    },
    '& .MuiToggleButton-root:disabled:not(:first-of-type)': {
      borderRadius: '8px',
    },
  }));

  /**
   * Handles single selection changes.
   * Calls `onChange` with the updated selection value.
   *
   * @param _event - The mouse event triggering the change.
   * @param newSelection - The new selection value.
   */
  const handleSingleSelection = (_event: React.MouseEvent<HTMLElement>, newSelection: string | null) => {
    onChange(newSelection as string);
  };

  /**
   * Handles multiple selection changes.
   * Calls `onChange` with the updated selection values.
   *
   * @param _event - The mouse event triggering the change.
   * @param newSelection - The new selection values.
   */
  const handleMultipleSelection = (_event: React.MouseEvent<HTMLElement>, newSelection: string[] | null) => {
    onChange(newSelection as string[]);
  };

  const GroupComponent = hasSpacing ? StyledToggleButtonGroup : ToggleButtonGroup;

  return (
    <GroupComponent
      value={selected}
      onChange={(event, newSelection) =>
        multiple
          ? handleMultipleSelection(event, newSelection as string[])
          : handleSingleSelection(event, newSelection as string | null)
      }
      orientation={orientation}
      size={size}
      fullWidth={fullWidth}
      exclusive={!multiple}
      aria-orientation={orientation}
    >
      {buttons.map((button) => (
        <ToggleButton
          aria-label={button.label}
          key={button.label}
          value={button.value}
          disabled={button.disabled || false}
        >
          {hasIcons && (selected === button.value || selected?.includes(button.value)) && (
            <CheckIcon fontSize="small" sx={{ mr: 2 }} />
          )}
          {button?.btnIcon ?? button.label}
        </ToggleButton>
      ))}
    </GroupComponent>
  );
};

export default PmxToggleBtnGroup;
