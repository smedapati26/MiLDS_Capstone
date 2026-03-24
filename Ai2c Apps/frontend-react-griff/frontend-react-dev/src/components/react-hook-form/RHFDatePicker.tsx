import dayjs from 'dayjs';
import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { DAYJS_DATE_FORMAT } from '@utils/constants';

/**
 * Props for the RHFDatePicker component.
 *
 * @template T - The type of the form values, extending FieldValues from react-hook-form.
 */
export type Props<T extends FieldValues> = {
  /** The name of the form field, used to register with react-hook-form. */
  field: Path<T>;
  /** Optional label for the date picker input field. */
  label?: string;
  /** Whether the field is required for form validation. */
  required?: boolean;
  /** Whether the date picker is disabled. */
  disabled?: boolean;
  // Add other MUI DatePicker props as needed
};

/**
 * RHFDatePicker is a React component that integrates MUI's DatePicker with react-hook-form.
 * It provides a date selection input that is fully controlled by the form context,
 * handling validation errors and form state automatically.
 *
 * @template T - The type of the form values.
 * @param props - The props for the component.
 * @returns A JSX element representing the date picker.
 */
export const RHFDatePicker = <T extends FieldValues>({
  field: name,
  label = '',
  required = false,
  disabled = false,
}: Props<T>) => {
  // Access the form control from the react-hook-form context
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        // Provide dayjs adapter for date localization
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label={label}
            // Convert stored value to dayjs object or null if no value
            value={value ? dayjs(value) : null}
            // Handle date change by formatting to string or null
            onChange={(date) => onChange(date ? date.format(DAYJS_DATE_FORMAT) : null)}
            disabled={disabled}
            slotProps={{
              textField: {
                required,
                // Show error state if there's a validation error
                error: !!error,
                // Display error message as helper text
                helperText: error?.message,
                // Make the text field full width
                fullWidth: true,
              },
            }}
          />
        </LocalizationProvider>
      )}
    />
  );
};
