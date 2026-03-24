import { useRef, useState } from 'react';
import { Dayjs } from 'dayjs';

import CloseIcon from '@mui/icons-material/Close';
import { ClickAwayListener, FormControl, FormHelperText, IconButton, useTheme } from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers';

import { slugify } from '@ai2c/pmx-mui';

/**
 * Props for the PmxDatePicker component.
 *
 * @interface PmxDatePickerProps
 * @property {Date | null} value - The current date value.
 * @property {(date: Dayjs | null) => void} onChange - Callback function to handle date changes.
 */
interface PmxDatePickerProps {
  value: Dayjs | null;
  onChange: (date: Dayjs | null) => void;
  label: string;
  hasIcon?: boolean;
  error?: boolean;
  helperText?: string;
  shrinkLabel?: boolean;
  disabled?: boolean;
  small?: boolean;
}

/**
 * PmxDatePicker component renders a date picker input with a controlled open state.
 *
 * @param {PmxDatePickerProps} props - The props for the PmxDatePicker component.
 * @returns {React.JSX.Element} The rendered date picker component.
 */
const PmxDatePicker = ({
  value,
  label,
  hasIcon = false,
  error,
  helperText,
  shrinkLabel = false,
  disabled = false,
  onChange,
  small = false,
}: PmxDatePickerProps) => {
  const idSlug = slugify(label);
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent | TouchEvent) => {
    const target = event.target as HTMLElement;
    const calendarClassName = 'MuiDateCalendar-root';

    if (
      pickerRef.current &&
      !pickerRef.current.contains(event.target as Node) &&
      !target.closest(`.${calendarClassName}`)
    ) {
      setOpen(false);
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClickOutside}>
      <FormControl fullWidth error={error} aria-describedby={idSlug + '-helper-text'} disabled={disabled}>
        <DesktopDatePicker
          {...(!hasIcon && { ref: pickerRef })}
          {...(!hasIcon && { open })}
          label={label}
          aria-label={label}
          value={value}
          onChange={onChange}
          disabled={disabled}
          sx={{
            '& .MuiInputLabel-root': {
              color: error ? theme.palette.error.main : undefined,
            },
            '& .Mui-focused': {
              color: error ? theme.palette.error.main : undefined,
            },
            '& .MuiInputBase-root': {
              borderColor: error ? theme.palette.error.main : 'default',
              borderWidth: error ? 2 : 1,
              borderStyle: error ? 'solid' : undefined,
            },
          }}
          slotProps={{
            textField: {
              ...(small && { size: 'small', height: 40 }),
              fullWidth: true,
              ...(error && {
                InputLabelProps: {
                  sx: { color: error && theme.palette.error.main },
                },
              }),
              ...(!hasIcon && {
                InputProps: {
                  endAdornment: (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(null);
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  ),
                  onClick: () => setOpen(true),
                },
              }),
              ...(shrinkLabel && {
                InputLabelProps: {
                  shrink: shrinkLabel,
                },
              }),
            },
          }}
        />
        {helperText && <FormHelperText id={idSlug + '-helper-text'}>{helperText}</FormHelperText>}
      </FormControl>
    </ClickAwayListener>
  );
};

export default PmxDatePicker;
