/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * PmxAutocomplete Component
 *
 * A customizable autocomplete input component built on top of Material-UI's Autocomplete.
 * Supports single and multiple selection, with custom rendering for tags and input field.
 * Designed for use in forms with options that have labels and values.
 */

import CloseIcon from '@mui/icons-material/Close';
import { Autocomplete, AutocompleteProps, AutocompleteRenderInputParams, Chip, TextField } from '@mui/material';

import { IOptionType } from '@models/IOptions';

/**
 * Props for the PmxAutocomplete component.
 * Extends standard Autocomplete props with custom properties.
 */
interface PmxAutocompleteProps<TValue>
  extends Omit<
    AutocompleteProps<IOptionType<TValue>, boolean, boolean, boolean>,
    'value' | 'onChange' | 'options' | 'multiple' | 'label' | 'error' | 'renderInput' | 'required'
  > {
  /** Array of options to display in the dropdown. */
  options: IOptionType<TValue>[];
  /** Current selected value(s). Can be a single option or an array for multiple selection. */
  value: any;
  /** Callback fired when the value changes. */
  onChange: (newValue: any) => void;
  /** Whether multiple options can be selected. Defaults to false. */
  multiple?: boolean;
  /** Label for the input field. */
  label?: string;
  /** Whether the input is in an error state. */
  error?: boolean;
  /** Helper text displayed below the input. */
  helperText?: string;
  /** Ref to attach to the input element. */
  inputRef?: React.Ref<any>;
  /** Whether the input is required. */
  required?: boolean;
  /** Allows forwarding additional props to the underlying Autocomplete component. */
  [key: string]: any;
}

/**
 * PmxAutocomplete component.
 * Renders a Material-UI Autocomplete with custom styling and behavior.
 */
export const PmxAutocomplete = <TValue,>({
  options,
  value,
  onChange,
  multiple = false,
  label = '',
  error = false,
  helperText = '',
  inputRef,
  required = false,
  ...otherProps
}: PmxAutocompleteProps<TValue>) => {
  return (
    <Autocomplete<IOptionType<TValue>, boolean, boolean, boolean>
      multiple={multiple}
      options={options}
      value={value}
      onChange={(_event, newValue) => onChange(newValue)}
      // Determines the display label for each option
      getOptionLabel={(option: any) => (typeof option === 'string' ? option : option.label || String(option.value))}
      // Checks if two options are equal for selection purposes
      isOptionEqualToValue={(option: any, val: any) =>
        typeof option === 'string' || typeof val === 'string' ? option === val : option.value === val?.value
      }
      freeSolo={false}
      // Renders the input field with custom props
      renderInput={(params: AutocompleteRenderInputParams) => (
        <TextField
          {...params}
          label={label}
          inputRef={inputRef}
          error={error}
          helperText={helperText}
          required={required}
        />
      )}
      limitTags={2}
      // Custom rendering for selected tags in multiple mode
      renderTags={(value, getTagProps) =>
        value.map((option: any, index) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              {...tagProps}
              key={option.value}
              label={option.label}
              deleteIcon={<CloseIcon />}
              sx={{
                borderRadius: 2,
                '& .MuiChip-deleteIcon': { fontSize: '18px', color: 'text.primary', marginRight: 2 },
              }}
            />
          );
        })
      }
      {...otherProps}
    />
  );
};
