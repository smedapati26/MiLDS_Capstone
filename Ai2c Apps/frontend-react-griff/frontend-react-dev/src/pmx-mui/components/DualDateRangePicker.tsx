import React, { useCallback, useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import { Box, Stack } from '@mui/material';
import { DateValidationError, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export interface DualDateRangePickerProps {
  label?: string;
  defaultStartDate: Dayjs | null;
  defaultEndDate: Dayjs | null;
  onDateRangeChange: (valid: boolean, defaultStartDate: Dayjs | null, defaultEndDate: Dayjs | null) => void;
  views?: Array<'day' | 'month' | 'year'>;
  format?: string;
  disableFuture?: boolean;
  disablePast?: boolean;
  sx?: Parameters<typeof DatePicker>[0]['sx'];
  className?: Parameters<typeof DatePicker>[0]['className'];
  size?: 'small' | 'medium';
  showCalendarIcon?: boolean;
}

/**
 * DateRangePicker component allows users to select a date range with validation and error handling.
 *
 * @component
 * @param {Object} props - The properties object.
 * @param {string} [props.label='Date'] - The label for the date range picker.
 * @param {Dayjs | null} [props.defaultEndDate=null] - The default end date.
 * @param {Dayjs | null} [props.defaultStartDate=null] - The default start date.
 * @param {function} props.onDateRangeChange - Callback function to handle date range changes.
 * @param {Array<string>} [props.views=['day', 'month', 'year']] - The views available for date selection.
 * @param {string} [props.format='MM/DD/YYYY'] - The date format.
 * @param {boolean} [props.disableFuture=false] - Flag to disable future dates.
 * @param {boolean} [props.showCalendarIcon] - to show calendar icon on the datepicker
 *
 * @returns {JSX.Element} The rendered date range picker component.
 */

export const DualDateRangePicker: React.FC<DualDateRangePickerProps> = ({
  label = 'Date',
  defaultStartDate,
  defaultEndDate,
  onDateRangeChange,
  views = ['day', 'month', 'year'],
  format = 'MM/DD/YYYY',
  disableFuture = false,
  disablePast = false,
  sx,
  className,
  size = 'medium',
  showCalendarIcon = true,
}) => {
  const [startDateError, setStartDateError] = useState<DateValidationError | null>(null);
  const [endDateError, setEndDateError] = useState<DateValidationError | null>(null);

  const validInput = useMemo(() => {
    return !(
      startDateError ||
      endDateError ||
      defaultStartDate?.toDate().toString() === 'Invalid Date' ||
      defaultEndDate?.toDate().toString() === 'Invalid Date' ||
      defaultStartDate === null ||
      defaultEndDate === null
    );
  }, [startDateError, endDateError, defaultStartDate, defaultEndDate]);

  const onStartChange = useCallback(
    (newStartVal: Dayjs | null) => {
      onDateRangeChange(validInput, newStartVal, defaultEndDate);
    },
    [validInput, defaultEndDate, onDateRangeChange],
  );

  const onEndChange = useCallback(
    (newEndVal: Dayjs | null) => {
      onDateRangeChange(validInput, defaultStartDate, newEndVal);
    },
    [validInput, defaultStartDate, onDateRangeChange],
  );

  const startDateErrorMessage = useMemo(() => {
    switch (startDateError) {
      case 'maxDate': {
        return 'Select a date before the end date';
      }

      case 'invalidDate': {
        return 'Your date is not valid';
      }

      case 'minDate': {
        return 'No data exists before 06/14/1775';
      }

      case 'disableFuture': {
        return 'Future dates are not allowed';
      }

      default: {
        return startDateError;
      }
    }
  }, [startDateError]);

  const endDateErrorMessage = useMemo(() => {
    switch (endDateError) {
      case 'minDate': {
        return 'Select a date after the start date';
      }

      case 'invalidDate': {
        return 'Your date is not valid';
      }

      case 'disableFuture': {
        return 'Future dates are not allowed';
      }

      default: {
        return endDateError;
      }
    }
  }, [endDateError]);

  const slotProps = useMemo(() => {
    if (size === 'medium') {
      return undefined;
    }
    return {
      textField: { size },
    };
  }, [size]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack data-testid={`date-range-${label}`} direction="column" id="pmx-date-range-picker" mt={3}>
        <Stack direction="row" spacing={3}>
          <Stack direction="column">
            <DatePicker
              disablePast={disablePast}
              views={views}
              label={`Start ${label} *`}
              value={defaultStartDate}
              onChange={onStartChange}
              format={format}
              maxDate={defaultEndDate || undefined}
              disableFuture={disableFuture}
              onError={setStartDateError}
              minDate={dayjs('1775-06-14')}
              sx={sx}
              className={className}
              slotProps={slotProps}
              slots={!showCalendarIcon ? { openPickerIcon: () => null } : undefined}
            />
            <ErrorMessageBox message={startDateErrorMessage} />
          </Stack>

          <Box component="span" sx={{ alignSelf: 'center', marginTop: '-14px !important' }}>
            &mdash;
          </Box>

          <Stack direction="column">
            <DatePicker
              disablePast={disablePast}
              views={views}
              label={`End ${label} *`}
              value={defaultEndDate}
              onChange={onEndChange}
              format={format}
              disableFuture={disableFuture}
              minDate={defaultStartDate || undefined}
              onError={setEndDateError}
              sx={sx}
              className={className}
              slotProps={slotProps}
              slots={!showCalendarIcon ? { openPickerIcon: () => null } : undefined}
            />
            <ErrorMessageBox message={endDateErrorMessage} />
          </Stack>
        </Stack>
      </Stack>
    </LocalizationProvider>
  );
};

const ErrorMessageBox: React.FC<{ message: string | null }> = ({ message }) => (
  <Box
    maxWidth={'inherit'}
    data-testid="error-message-box"
    sx={{
      paddingLeft: '8px',
      minHeight: '16px',
      color: 'error.main',
      fontSize: '14px',
      fontWeight: '300',
      visibility: message ? 'visible' : 'hidden',
    }}
  >
    {message}
  </Box>
);
