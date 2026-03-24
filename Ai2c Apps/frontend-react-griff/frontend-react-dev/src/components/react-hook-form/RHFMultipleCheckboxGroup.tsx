/**
 * RHFMultipleCheckboxGroup Component
 *
 * A React Hook Form (RHF) integrated component that renders a group of checkboxes
 * for selecting multiple values. It uses Material-UI components and supports
 * both string arrays and IOptions objects for flexibility in option definitions.
 *
 * This component integrates with react-hook-form's Controller to manage form state,
 * validation, and error handling seamlessly.
 */

import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel } from '@mui/material';

import { IOptions } from '@models/IOptions';

/**
 * Props for the RHFMultipleCheckboxGroup component.
 *
 * @template T - The type of the form values, extending FieldValues from react-hook-form.
 */
interface RHFMultipleCheckboxGroupProps<T extends FieldValues> {
  /** The name of the form field, used to register with react-hook-form. */
  field: Path<T>;
  /** Array of options for the checkboxes. Can be strings or IOptions objects. */
  options: string[] | IOptions[];
  /** Optional label for the checkbox group. */
  label?: string;
  /** Select all option */
  allSelectable?: boolean;
}

/**
 * RHFMultipleCheckboxGroup - A multiple checkbox group component for React Hook Form.
 *
 * This component allows users to select multiple options from a list of checkboxes.
 * It handles the form integration, state management, and rendering using Material-UI.
 *
 * @template T - The type of the form values.
 * @param props - The component props.
 * @returns A JSX element representing the checkbox group.
 */
export const RHFMultipleCheckboxGroup = <T extends FieldValues>(props: RHFMultipleCheckboxGroupProps<T>) => {
  const { field: name, label, options, allSelectable } = props;
  // Access the form control from react-hook-form context to manage form state
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        return (
          <FormControl component="fieldset" error={!!error} fullWidth>
            {/* Render the label if provided */}
            {label && (
              <FormLabel component="legend" sx={{ color: 'text.primary' }}>
                {label}
              </FormLabel>
            )}
            <FormGroup sx={{ p: 2 }}>
              {/* Select All Option */}
              {allSelectable && (
                <FormControlLabel
                  key="select-all-checkbox"
                  control={
                    <Checkbox
                      // Check if the current option value is in the field's value array
                      checked={field.value.includes('all')}
                      onChange={(e) => {
                        // Update the field's value array based on checkbox state
                        const newValue = e.target.checked
                          ? [
                              'all',
                              ...options.flatMap((option) => (typeof option === 'string' ? option : option.value)),
                            ] // Add all
                          : []; // Remove all
                        field.onChange(newValue);
                      }}
                      value="all"
                    />
                  }
                  label="Select All"
                />
              )}
              {/* Map over options to render each checkbox */}
              {options.map((option, index) => {
                // Determine label and value based on option type
                const optionLabel = typeof option === 'string' ? option : option.label;
                const optionValue = typeof option === 'string' ? option : option.value;

                return (
                  <FormControlLabel
                    key={`${optionValue}-checkbox-${index}`}
                    control={
                      <Checkbox
                        // Check if the current option value is in the field's value array
                        checked={field.value.includes(optionValue)}
                        onChange={(e) => {
                          // Update the field's value array based on checkbox state
                          const newValue = e.target.checked
                            ? [...field.value, optionValue] // Add value to array if checked
                            : field.value.filter((val: string) => val !== optionValue); // Remove value if unchecked
                          field.onChange(newValue);
                        }}
                        value={optionValue}
                      />
                    }
                    label={optionLabel}
                  />
                );
              })}
            </FormGroup>
          </FormControl>
        );
      }}
    />
  );
};
