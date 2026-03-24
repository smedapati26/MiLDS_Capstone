/**
 * RHFChipButtonGroup is a React component that integrates the ChipButtonGroup input
 * with react-hook-form. It provides form control and validation for chip button selections,
 * supporting both single and multi-select modes.
 */

import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

import { FormControl, FormLabel } from '@mui/material';

import { IOptions } from '@models/IOptions';

import ChipButtonGroup from '../inputs/PmxChipButtonGroup';

/**
 * Props for the RHFChipButtonGroup component.
 * @template T - The type of the form values, extending FieldValues.
 */
export type Props<T extends FieldValues> = {
  /** The name of the form field, used by react-hook-form for registration. */
  field: Path<T>;
  /** The label displayed for the chip button group. */
  label: string;
  /** Array of options for the chip buttons, can be IOptions objects or strings. */
  options: Array<IOptions | string>;
  /** Optional flag to enable multi-select mode. Defaults to false. */
  multiselect?: boolean;
};

/**
 * RHFChipButtonGroup component that wraps ChipButtonGroup with react-hook-form's Controller.
 * Handles form state management and validation for chip button selections.
 * @template T - The type of the form values.
 * @param props - The component props.
 * @returns The rendered Controller with ChipButtonGroup.
 */
export const RHFChipButtonGroup = <T extends FieldValues>(props: Props<T>) => {
  // Destructure props
  const { field: name, label, options, multiselect = false } = props;
  // Get the form control from the context
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: 'Status is required' }} // Basic validation rule (can be customized or use Yup)
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl component="fieldset" error={!!error} fullWidth>
          {label && (
            <FormLabel component="legend" sx={{ color: 'text.primary', pb: 2 }}>
              {label}
            </FormLabel>
          )}
          {/* Render the ChipButtonGroup with form field props */}
          <ChipButtonGroup options={options} value={value} onChange={onChange} multiselect={multiselect} />
        </FormControl>
      )}
    />
  );
};
