import CloseIcon from '@mui/icons-material/Close';
import { Autocomplete, Chip, SxProps, TextField, Theme, useTheme } from '@mui/material';

import { IOptions } from '@models/IOptions';

/**
 * Props for the MultiChipAutocomplete component.
 */
export interface MultiChipAutocompleteProps {
  /** The label displayed on the input field. */
  label: string;
  /** Array of options available for selection, each with a key and label. */
  options?: Array<IOptions>;
  /** The currently selected options. */
  value: IOptions[];
  /** Callback fired when the value changes. */
  onChange: (newValue: IOptions[]) => void;
  /** Error object for displaying validation errors. */
  error?: { message?: string };
  /** Ref for the input field. */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Custom styles applied to the Autocomplete component. */
  sx?: SxProps<Theme>;
}

/**
 * A multi-chip autocomplete component.
 *
 * This component allows users to select multiple options from a dropdown list,
 * displaying each selection as a removable chip. It uses Material-UI's Autocomplete
 * for the UI components.
 *
 * @param props - The component props.
 * @returns The rendered Autocomplete component with chips.
 */
export const MultiChipAutocomplete = ({
  label,
  options = [],
  value,
  onChange,
  error,
  inputRef,
  sx,
}: MultiChipAutocompleteProps) => {
  const { palette } = useTheme();

  return (
    <Autocomplete
      multiple // Allow multiple selections
      aria-label={label} // Accessibility label
      limitTags={2} // Limits Tags and adds +(n)
      options={options} // List of available options
      value={value} // Currently selected options
      getOptionLabel={(option: IOptions) => option.label} // Display label for each option
      isOptionEqualToValue={(option, selected) => option.value === selected.value} // Equality check for options
      onChange={(_event, newValue) => onChange(newValue)} // Update value
      renderInput={(params) => (
        // Render the input field
        <TextField
          {...params}
          fullWidth
          inputRef={inputRef}
          label={label}
          error={!!error}
          helperText={error?.message}
        />
      )}
      renderTags={(value, getTagProps) =>
        // Render selected options as chips
        value.map((option: IOptions, index) => {
          // Extract tag props, excluding 'key' to avoid conflicts
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              {...tagProps}
              key={option.value} // Unique key for the chip
              label={option.label} // Display label on the chip
              deleteIcon={<CloseIcon />} // Icon for removing the chip
              sx={{
                borderRadius: 2 /* 8px */, // Rounded corners
                '& .MuiChip-deleteIcon': { fontSize: '18px', color: palette.text.primary, marginRight: 2 }, // Style the delete icon
              }}
            />
          );
        })
      }
      disableCloseOnSelect // Keep dropdown open after selecting an option
      sx={sx} // Custom styles
    />
  );
};
