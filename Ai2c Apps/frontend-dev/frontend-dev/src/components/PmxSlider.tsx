import { ChangeEvent, useEffect, useState } from 'react';

import { Box, CSSProperties, InputAdornment, Slider, TextField, Typography } from '@mui/material';

interface PmxSliderProps {
  label?: string;
  value: number;
  handleChange: ((event: Event | null, value: number | number[]) => void) | undefined;
  hasInput?: boolean;
  marks?: { value: number; label: string }[];
  step?: number;
  min?: number;
  max?: number;
  isPercentage?: boolean;
  containerSx?: CSSProperties;
  sliderSx?: CSSProperties;
}

/**
 * PmxSlider component renders a Slider component.
 *
 * @component
 * @param {PmxSliderProps} props - The properties interface.
 * @param {string} props.label - Label for slider
 * @param {number} props.value - Current value of slider
 * @param {number} props.min - Minimum value of slider
 * @param {number} props.max - Maximum value of slider
 * @param {boolean} props.isPercentage - Flag to indicate if the slider value displays as percentage
 * @param {CSSProperties} props.containerSx - CSS styles for the container around the slider
 * @param {CSSProperties} props.sliderSx - CSS styles for the slider
 * @param {{ value: number; label: string }[]} props.marks - Slider markings
 * @param {boolean} props.hasInput - Flag to indicate if the slider has an input value field.
 * @param {function(T[]: void)} props.handleChange - Callback function for slider state management
 *
 * @returns {ReactNode} The rendered slider component.
 */
const PmxSlider = ({
  label,
  value,
  min = 0,
  max = 100,
  step,
  hasInput,
  marks,
  containerSx,
  sliderSx,
  handleChange,
  isPercentage = false,
}: PmxSliderProps) => {
  const [inputValue, setInputValue] = useState<number>(value);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = Number(event.target.value);

    if (newValue < min) {
      setError(`Value must be at least ${min}`);
    } else if (newValue > max) {
      setError(`Value must be at most ${max}`);
    } else {
      setError(null);
    }

    setInputValue(newValue);
    handleChange?.(null, newValue);
  };

  useEffect(() => {
    if (inputValue !== undefined && inputValue !== null) {
      handleChange?.(null, inputValue);
    }
  }, [inputValue, handleChange]);

  return (
    <Box {...(containerSx && { sx: containerSx })}>
      {label && (
        <Typography
          variant="body1"
          sx={{ mb: 2.5 }}
          data-testid="pmx-slider-label"
          {...(label && { 'aria-labelledby': label })}
        >
          {label}
        </Typography>
      )}
      <Box display="flex">
        <Slider
          sx={{ ml: 3, ...(sliderSx && { ...sliderSx }) }}
          value={inputValue}
          min={min}
          max={max}
          {...(step && { step })}
          onChange={(_, newValue) => setInputValue(newValue as number)}
          valueLabelDisplay="auto"
          marks={marks}
          track={isPercentage ? 'inverted' : 'normal'}
        />
        {hasInput && (
          <TextField
            sx={{ ml: 8 }}
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            inputProps={{ min, max }}
            error={!!error}
            helperText={error}
            InputProps={{
              endAdornment: isPercentage ? <InputAdornment position="end">%</InputAdornment> : null,
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default PmxSlider;
