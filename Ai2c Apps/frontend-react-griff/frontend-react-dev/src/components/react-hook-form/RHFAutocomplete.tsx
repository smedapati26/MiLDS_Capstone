/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';

import { AutocompleteProps } from '@mui/material/Autocomplete';

import { IOptionType } from '@models/IOptions';

import { PmxAutocomplete } from '../inputs/PmxAutocomplete';

/**
 * A reusable React Hook Form (RHF) wrapper for MUI Autocomplete.
 * Supports both single and multiple selections.
 *
 * Assumptions:
 * - Options are an array of objects with { label: string, value: TValue } shape.
 *   - For single select: form value is the `value` of the selected option (or null).
 *   - For multiple select: form value is an array of `value`s (or empty array).
 * - If your options are simple strings, adjust the `getOptionLabel`, `isOptionEqualToValue`, and value mapping accordingly.
 *
 * Props:
 * - name: string (RHF field name)
 * - control: Control from useForm()
 * - options: Array of { label: string, value: TValue }
 * - multiple: boolean (default: false)
 * - label: string (optional, for TextField)
 * - ...otherProps: Forwarded to Autocomplete (e.g., placeholder, disabled, etc.)
 */

interface RHFAutocompleteProps<
  TValue = unknown,
  TFormValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFormValues> = FieldPath<TFormValues>,
> extends Omit<
    AutocompleteProps<IOptionType<TValue>, boolean, boolean, boolean>,
    'value' | 'onChange' | 'options' | 'multiple' | 'renderInput'
  > {
  field: TName;
  options: IOptionType<TValue>[];
  value?: string;
  multiple?: boolean;
  label?: string;
  required?: boolean;
  rules?: any; // Validation rules for react-hook-form
}

export const RHFAutocomplete = <
  TValue = unknown,
  TFormValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFormValues> = FieldPath<TFormValues>,
>({
  field: name,
  value: _value,
  options,
  multiple = false,
  label = '',
  rules,
  ...otherProps
}: RHFAutocompleteProps<TValue, TFormValues, TName>) => {
  // Access the form control from react-hook-form context
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value, ref, ...fieldRest }, fieldState: { error } }) => {
        // Transform form value to full option objects for MUI Autocomplete's value prop
        const getValueAsOptions = (): IOptionType<TValue> | IOptionType<TValue>[] | null => {
          if (multiple) {
            if (!Array.isArray(value)) return [];
            return options.filter((option) => (value as TValue[]).includes(option.value));
          } else {
            if (!value) return null;
            if (!_value) return options.find((option) => option.value === value) || null;
            return options.find((option) => option.value === _value) || null;
          }
        };

        // Handle change: extract values from selected options
        const handleChange = (newValue: any) => {
          if (multiple) {
            const newValues = newValue ? (newValue as IOptionType<TValue>[]).map((option) => option.value) : [];
            onChange(newValues as any); // Type assertion for RHF
          } else {
            const newValueExtracted = newValue ? (newValue as IOptionType<TValue>).value : '';
            onChange(newValueExtracted as any); // Type assertion for RHF
          }
        };

        return (
          <PmxAutocomplete<TValue>
            multiple={multiple}
            disableCloseOnSelect={multiple}
            options={options}
            value={getValueAsOptions()}
            onChange={handleChange}
            label={label}
            error={!!error}
            helperText={error?.message}
            inputRef={ref}
            {...fieldRest}
            {...otherProps}
          />
        );
      }}
    />
  );
};
