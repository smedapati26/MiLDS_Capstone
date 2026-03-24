import React from 'react';
import dayjs from 'dayjs';
import { Controller, useFormContext } from 'react-hook-form';

import RemoveIcon from '@mui/icons-material/Remove';
import { FormLabel, Stack } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { DAYJS_DATE_FORMAT } from '@utils/constants';

interface RHFDateRangePickerProps {
  field: string;
  label?: string;
  startLabel?: string;
  endLabel?: string;
  required?: boolean;
  disabled?: boolean;
  width?: string;
  // Add other shared MUI DatePicker props as needed
}

export const RHFDateRangePicker: React.FC<RHFDateRangePickerProps> = ({
  field,
  label,
  startLabel = 'Start Date',
  endLabel = 'End Date',
  required = false,
  disabled = false,
  width,
}) => {
  const { control } = useFormContext();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {label && <FormLabel sx={{ color: 'text.primary', pb: 2 }}>{label}</FormLabel>}
      <Stack direction="row" gap={2} alignItems="flex-start">
        <Controller
          name={`${field}.startDate`}
          control={control}
          render={({ field: { onChange, value }, fieldState: { error: startError } }) => (
            <DatePicker
              label={startLabel}
              value={value ? dayjs(value) : null}
              onChange={(date) => onChange(date ? date.format(DAYJS_DATE_FORMAT) : null)}
              disabled={disabled}
              sx={{ width: width }}
              slotProps={{
                textField: {
                  required,
                  error: !!startError,
                  helperText: startError?.message,
                  fullWidth: true,
                },
              }}
            />
          )}
        />
        <RemoveIcon fontSize="small" sx={{ marginTop: 4 }} />
        <Controller
          name={`${field}.endDate`}
          control={control}
          render={({ field: { onChange, value }, fieldState: { error: endError } }) => (
            <DatePicker
              label={endLabel}
              value={value ? dayjs(value) : null}
              onChange={(date) => onChange(date ? date.format(DAYJS_DATE_FORMAT) : null)}
              disabled={disabled}
              sx={{ width: width }}
              slotProps={{
                textField: {
                  required,
                  error: !!endError,
                  helperText: endError?.message,
                  fullWidth: true,
                },
              }}
            />
          )}
        />
      </Stack>
    </LocalizationProvider>
  );
};

export default RHFDateRangePicker;
