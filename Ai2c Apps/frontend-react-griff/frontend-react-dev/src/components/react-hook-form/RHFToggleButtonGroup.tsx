/**
 * React Hook Form Toggle Button Group Component
 *
 * This component integrates Material-UI's ToggleButtonGroup with react-hook-form,
 * allowing for form-controlled toggle button groups with validation and state management.
 */

import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

import {
  Stack,
  SxProps,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
  Typography,
} from '@mui/material';

/**
 * Props for the RHFToggleButtonGroup component.
 *
 * Extends ToggleButtonGroupProps from Material-UI, omitting 'value' and 'onChange'
 * as they are handled internally by react-hook-form.
 */
interface RHFToggleButtonGroupProps<T extends FieldValues> extends Omit<ToggleButtonGroupProps, 'value' | 'onChange'> {
  /** The name of the form field, used by react-hook-form for registration and validation. */
  field: Path<T>;
  /** Array of string options to display as toggle buttons. */
  options: string[];
  /** Optional label to display above the toggle button group. */
  label?: string;
  /** Whether the toggle group allows only one selection (exclusive) or multiple (non-exclusive). Defaults to true. */
  exclusive?: boolean;
  /** Custom styling props for the component. */
  sx?: SxProps<Theme>;
}

/**
 * A form-controlled toggle button group component using react-hook-form and Material-UI.
 *
 * This component renders a group of toggle buttons where the selection is managed by react-hook-form.
 * It supports both exclusive (single selection) and non-exclusive (multiple selection) modes.
 *
 * @template T - The type of the form values object.
 * @param props - The component props.
 * @returns The rendered RHFToggleButtonGroup component.
 */
export const RHFToggleButtonGroup = <T extends FieldValues>(props: RHFToggleButtonGroupProps<T>) => {
  // Destructure props, with default value for exclusive
  const { field: name, label, options, exclusive = true, sx } = props;
  // Access the form control from react-hook-form context to manage form state
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <Stack gap={3}>
          {/* Render the label if provided */}
          {label && <Typography variant="body1">{label}</Typography>}
          <ToggleButtonGroup
            value={value}
            exclusive={exclusive}
            // Handle value changes by calling the form's onChange function
            onChange={(_event, newValue) => onChange(newValue)}
            // Spread remaining props to the ToggleButtonGroup
            {...props}
            sx={{ ...sx }}
          >
            {/* Map over options to create individual toggle buttons */}
            {options.map((option: string, index) => (
              <ToggleButton key={`${option}-toggle-button-${index}`} value={option}>
                {option}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      )}
    />
  );
};
