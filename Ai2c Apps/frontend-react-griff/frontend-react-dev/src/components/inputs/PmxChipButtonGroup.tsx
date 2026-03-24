/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * PmxChipButtonGroup Component
 *
 * A customizable chip button group component that allows users to select one or multiple options
 * from a list of chips. It supports both single and multi-select modes, with visual feedback
 * for selected states. Built using Material-UI components and integrates with the application's theme.
 */

import { useMemo, useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import { Chip, FormControl, FormLabel, Stack, useTheme } from '@mui/material';

import { IOptions } from '@models/IOptions';

/**
 * Props for the PmxChipButtonGroup component.
 * This component renders a group of chip buttons that allow users to select one or multiple options.
 */
export type PmxChipButtonGroupProps = {
  /** Array of options to display as chips. Each option can be an IOptions object or a string. */
  options: Array<IOptions | string>;
  /** Callback function triggered when the selection changes. Receives the new selection(s). */
  onChange: (...event: Array<any>) => void;
  /** Initial value(s) for the selected chips. Can be a single string or an array of strings. */
  value?: Array<string> | string;
  /** Optional label displayed above the chip group. */
  label?: string;
  /** Whether the chip group is disabled. Defaults to false. */
  disabled?: boolean;
  /** Whether multiple selections are allowed. Defaults to false (single select). */
  multiselect?: boolean;
};

/**
 * PmxChipButtonGroup component implementation.
 *
 * @param options - Array of options to display as chips.
 * @param onChange - Callback function called when selection changes.
 * @param value - Initial selected values.
 * @param label - Optional label for the group.
 * @param disabled - Whether the component is disabled.
 * @param multiselect - Whether multiple selections are allowed.
 */
export const PmxChipButtonGroup: React.FC<PmxChipButtonGroupProps> = ({
  options,
  onChange,
  value,
  label,
  disabled = false,
  multiselect = false,
}) => {
  // State to track selected chip keys
  const [selections, setSelections] = useState<Array<string>>(value ? (Array.isArray(value) ? value : [value]) : []);

  // Theme hook to access palette for dark mode detection
  const { palette } = useTheme();
  // Memoized check for dark mode to optimize re-renders
  const isDarkMode = useMemo(() => palette.mode === 'dark', [palette.mode]);

  // Common styles for all chips
  const commonCSS = { py: 4, borderRadius: 2 };
  // Styles for selected chips, adapting to theme
  const selectedCSS = {
    ...commonCSS,
    borderColor: 'primary.main',
    '& .MuiChip-icon': { color: 'text.primary' },
    '&.MuiChip-clickable': {
      backgroundColor: isDarkMode ? 'primary.d60' : 'primary.l60',
      '&:hover': {
        backgroundColor: 'primary.l40',
      },
    },
  };

  /* Handles chip click events to toggle selection. */
  const handleClick = (value: string) => {
    const isSelected = selections.includes(value);

    if (multiselect) {
      // For multiselect mode: add or remove the selection
      const newSelections = isSelected ? [...selections.filter((option) => option !== value)] : [...selections, value];
      setSelections(newSelections);
      onChange(newSelections);
    } else {
      // For single select mode: select or deselect the chip
      setSelections(isSelected ? [] : [value]);
      onChange(isSelected ? null : value);
    }
  };

  return (
    <FormControl component="fieldset" fullWidth>
      {label && (
        <FormLabel component="legend" sx={{ color: 'text.primary', pb: 2 }}>
          {label}
        </FormLabel>
      )}
      {/* Render the ChipButtonGroup with form field props */}
      {/* Stack container for horizontal chip layout */}
      <Stack direction="row" gap={2}>
        {options.map((chip: IOptions | string) => {
          // Determine if chip is a string or IOptions object
          const isString = typeof chip === 'string';
          // Extract key and label based on type
          const key = isString ? chip : chip.value;
          const isSelected = selections.includes(key);

          return (
            <Chip
              key={key}
              label={isString ? chip : chip.label}
              // Show check icon if selected
              icon={isSelected ? <CheckIcon sx={{ fontSize: '18px' }} /> : <></>}
              onClick={() => handleClick(key)}
              clickable={!disabled}
              disabled={disabled}
              variant="outlined"
              // Apply selected or common styles
              sx={isSelected ? selectedCSS : commonCSS}
            />
          );
        })}
      </Stack>
    </FormControl>
  );
};
export default PmxChipButtonGroup;
