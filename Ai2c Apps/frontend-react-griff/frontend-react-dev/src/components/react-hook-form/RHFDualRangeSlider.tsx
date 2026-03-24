/**
 * RHFDualRangeSlider Component
 *
 * A React Hook Form (RHF) integrated dual-range slider component that optionally includes a checkbox
 * to enable or disable the slider. This component wraps the PmxDualSlider with RHF's Controller
 * for form integration, allowing it to be used within forms managed by react-hook-form.
 *
 * The slider supports customizable marks, min/max values, step size, and can be conditionally
 * disabled based on the checkbox state or a disabled prop.
 */

import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

import { Checkbox, Stack } from '@mui/material';
import { Mark } from '@mui/material/Slider/useSlider.types';

import { generateSliderMarks } from '@utils/helpers';

import { PmxDualSlider } from '../inputs/PmxDualSlider';

/**
 * Props for the RHFDualRangeSlider component.
 *
 * @template T - The type of the form values, extending FieldValues from react-hook-form.
 */
export type Props<T extends FieldValues> = {
  /** The name/path of the field in the form for the slider value. */
  field: Path<T>;
  /** The label displayed for the slider. */
  label: string;
  /** Optional name/path for the checkbox field that controls slider enable/disable. If provided, a checkbox is rendered. */
  checkboxField?: string;
  /** Optional custom marks for the slider. If not provided, marks are auto-generated. */
  marks?: Array<Mark>;
  /** Minimum value for the slider. Defaults to 0. */
  min?: number;
  /** Maximum value for the slider. Defaults to 100. */
  max?: number;
  /** Step size for the slider. Defaults to 1. */
  step?: number;
  /** Whether the slider is disabled. Defaults to false. */
  disabled?: boolean;
};

/**
 * RHFDualRangeSlider Component
 *
 * Renders a dual-range slider integrated with react-hook-form. If checkboxField is provided,
 * a checkbox is displayed to toggle the slider's enabled state. The slider is disabled if the
 * checkbox is unchecked or if the disabled prop is true.
 *
 * @param props - The props for the component.
 * @returns The rendered component.
 */
export const RHFDualRangeSlider = <T extends FieldValues>(props: Props<T>) => {
  // Destructure props with default values
  const { field: name, label, checkboxField, marks, min = 0, max = 100, step = 1, disabled = false } = props;
  // Access form control and watch function from react-hook-form context
  const { control, watch } = useFormContext();

  // Watch the checkbox value to determine if the slider should be enabled
  const checked = watch(checkboxField as string);

  return (
    <Stack direction="row" gap={3}>
      {/* Render checkbox if checkboxField is provided */}
      {!!checkboxField && (
        <Controller
          name={checkboxField}
          control={control}
          defaultValue={false}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Checkbox
              checked={!!value} // Ensure the checked prop is a boolean
              onChange={onChange}
              onBlur={onBlur}
              inputRef={ref}
            />
          )}
        />
      )}

      {/* Render the dual-range slider */}
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <PmxDualSlider
            label={label}
            // Disable slider if checkbox is unchecked or component is disabled
            disabled={!checked || disabled}
            onChange={onChange}
            value={value}
            min={min}
            max={max}
            step={step}
            // Use provided marks or generate them automatically
            marks={marks ? marks : generateSliderMarks(min, max, max / 25, max / 5)}
            sx={{ marginBottom: 8, ml: 2, width: 'calc(100% - 16px)' /* Adjustments to match Figma designs */ }}
          />
        )}
      />
    </Stack>
  );
};
