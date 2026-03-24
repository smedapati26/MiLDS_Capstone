/**
 * @fileoverview A reusable toggle button group component built with Material-UI.
 * Allows users to select one option from a list of provided options.
 */

import { useCallback, useEffect, useState } from 'react';

import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import { IOptions } from '@models/IOptions';

/**
 * Props for the PmxToggleButtonGroup component.
 */
export type PmxToggleButtonGroupProps = {
  /** Array of string options to display as toggle buttons. */
  options: Array<string> | Array<IOptions>;
  /** Optional callback function invoked when a selection is made, passing the selected value. */
  onChange?: (value: string) => void;
  /** Optional default selected value. If not provided, defaults to the first option. */
  value?: string | IOptions | null;
  /** Optional flag to disable the entire toggle button group. */
  disabled?: boolean;
  /** Min-width sets all the button widths the same width */
  minWidth?: number | string;
  size?: 'small' | 'medium' | 'large';
};

/**
 * PmxToggleButtonGroup is a React component that renders a group of toggle buttons
 * using Material-UI's ToggleButtonGroup. It supports exclusive selection (only one
 * button can be selected at a time) and provides a callback for selection changes.
 *
 * @param props - The props for the component.
 * @returns A JSX element representing the toggle button group.
 */
export const PmxToggleButtonGroup: React.FC<PmxToggleButtonGroupProps> = (props: PmxToggleButtonGroupProps) => {
  // Destructure props with default values
  const { options, onChange, value: defaultValue, disabled = false, minWidth = 120, size = 'small' } = props;

  // Helper function to get the initial value as a string | null
  const getInitialValue = useCallback((): string => {
    if (defaultValue) {
      return typeof defaultValue === 'string' ? defaultValue : defaultValue.value;
    }

    const first = options[0];
    return first ? (typeof first === 'string' ? first : first.value) : '';
  }, [defaultValue, options]);

  // State to track the currently selected value, initialized to value or first option
  const [value, setValue] = useState<string>(getInitialValue());

  // Effect to update internal state when defaultValue prop changes
  useEffect(() => {
    setValue(getInitialValue());
  }, [defaultValue, getInitialValue, options]);

  /**
   * Handler for when a toggle button is selected.
   * Updates the internal state and calls the parent's onChange callback.
   *
   * @param _event - The mouse event (unused in this implementation).
   * @param selection - The value of the selected button.
   */
  const handleOnChange = (_event: React.MouseEvent<HTMLElement>, selection: string) => {
    if (selection) setValue(selection); // Update internal state with the new selection
    if (onChange) onChange(selection); // Notify parent component of the selection change
  };

  return (
    <ToggleButtonGroup
      exclusive // Ensures only one button can be selected at a time
      size={size} // Sets the button size to small for a compact appearance
      value={value} // The currently selected value
      onChange={handleOnChange} // Handler for selection changes
      disabled={disabled} // Disables the group if the disabled prop is true
      sx={{ '& .MuiToggleButton-root': { px: 4 } }} // Custom styling for horizontal padding on buttons
    >
      {/* Render a ToggleButton for each option */}
      {options.map((option) => {
        const optValue = typeof option === 'string' ? option : option.value;
        const display = typeof option === 'string' ? option : option.label;
        return (
          <ToggleButton key={optValue} value={optValue} aria-label={display} sx={{ minWidth: minWidth }}>
            {display}
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
};

export default PmxToggleButtonGroup;
