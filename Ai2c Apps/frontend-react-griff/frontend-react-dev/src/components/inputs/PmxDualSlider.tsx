/**
 * PmxDualSlider Component
 *
 * A customizable dual-range slider component built using Material-UI's Slider.
 * It allows users to select a range of values between a minimum and maximum,
 * with options for labels, marks, step increments, and more.
 *
 * This component is designed for use in forms or interfaces where range selection is needed,
 * such as filtering data by numerical ranges (e.g., price, age, etc.).
 */

import { Box, Slider, SxProps, Theme, Typography } from '@mui/material';
import { Mark } from '@mui/material/Slider/useSlider.types';

/**
 * Props for the PmxDualSlider component.
 */
type PmxDualSliderProps = {
  /** Callback function triggered when the slider value changes. Receives the new range as [min, max]. */
  onChange: (newValue: [number, number]) => void;
  /** Current value of the slider as a tuple [min, max]. Defaults to [0, 100]. */
  value?: [number, number];
  /** Optional label displayed above the slider. */
  label?: string;
  /** Minimum value for the slider. Defaults to 0. */
  min?: number;
  /** Maximum value for the slider. Defaults to 100. */
  max?: number;
  /** Step increment for the slider. Defaults to 1. */
  step?: number;
  /** Marks to display on the slider. Can be an array of Mark objects or false to disable. Defaults to false. */
  marks?: Array<Mark>;
  /** Whether the slider is disabled. Defaults to false. */
  disabled?: boolean;
  /** Controls the display of value labels on the slider thumbs. Options: 'on', 'auto', 'off'. Defaults to 'auto'. */
  valueLabelDisplay?: 'on' | 'auto' | 'off';
  /** Custom styles applied to the Slider component using MUI's SxProps. */
  sx?: SxProps<Theme>;
};

/**
 * PmxDualSlider: A React functional component for rendering a dual-range slider.
 *
 * @param props - The props for configuring the slider.
 * @returns A JSX element containing the slider and optional label.
 */
export const PmxDualSlider: React.FC<PmxDualSliderProps> = ({
  onChange,
  value = [0, 100], // Default range [min, max]
  min = 0,
  max = 100,
  step = 1,
  marks = false, // Set to true for default marks, or provide an array of custom marks
  label,
  disabled = false,
  valueLabelDisplay = 'auto', // Controls when value labels are shown
  sx,
}) => {
  /**
   * Handles changes to the slider value.
   * Converts the event value to a tuple and calls the onChange callback.
   *
   * @param _event - The change event (unused in this implementation).
   * @param value - The new value from the slider, either a number or array.
   */
  const handleChange = (_event: Event, value: number | number[]) => {
    onChange(value as [number, number]); // Ensure value is treated as [min, max] range
  };

  return (
    <Box width={'100%'}>
      {/* Render the label if provided */}
      {label && <Typography variant="body1">{label}</Typography>}
      {/* The Material-UI Slider component with all configured props */}
      <Slider
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        marks={marks}
        valueLabelDisplay={valueLabelDisplay}
        disabled={disabled}
        sx={{ ...sx }}
      />
    </Box>
  );
};
