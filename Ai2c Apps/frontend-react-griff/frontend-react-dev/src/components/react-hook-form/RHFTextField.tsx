import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

import { FormControl, MenuItem, TextField, TextFieldProps } from '@mui/material';

import { slugify } from '@ai2c/pmx-mui';

import { IOptions } from '@models/IOptions';

/**
 * Props for the RHFTextField component.
 * @template T - The type of the form values, extending FieldValues.
 */
export type Props<T extends FieldValues> = {
  /** The name of the form field, used by react-hook-form for registration. */
  field: Path<T>;
  /** The label displayed for the chip button group. */
  label: string;
  /** Options makes it a selectable Textfield */
  options?: string[] | IOptions[];
} & Omit<TextFieldProps, 'value' | 'onChange' | 'error' | 'helperText' | 'label' | 'select'>;

/**
 * RHFTextField is a simple TextField with react-hook-form's Controller.
 * Handles form state management and validation.
 * @template T - The type of the form values.
 * @param props - The component props.
 * @returns The rendered Controller with RHFTextField.
 */
export const RHFTextField = <T extends FieldValues>(props: Props<T>) => {
  // Destructure props
  const { field: fieldName, label, options, ...textFieldProps } = props;
  // Get the form control from the context
  const { control } = useFormContext();

  return (
    <Controller
      name={fieldName}
      control={control}
      // Validation is handled by the schema resolver
      render={({ field, fieldState: { error } }) => (
        <FormControl component="fieldset" error={!!error} fullWidth>
          {/* Render  field if multiple options  */}
          {options ? (
            <TextField
              {...field}
              {...textFieldProps}
              label={label}
              fullWidth
              select
              error={!!error}
              helperText={error?.message}
            >
              {options.map((option, i) => {
                const value = typeof option === 'string' ? option : option.value;
                const label = typeof option === 'string' ? option : option.label;
                return (
                  <MenuItem key={slugify(`${i}-${value}`)} value={label}>
                    {label}
                  </MenuItem>
                );
              })}
            </TextField>
          ) : (
            <TextField
              {...field}
              {...textFieldProps}
              label={label}
              fullWidth
              error={!!error}
              helperText={error?.message}
            />
          )}
        </FormControl>
      )}
    />
  );
};
