import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import InfoIcon from '@mui/icons-material/Info';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import { DualDateRangePicker } from '@ai2c/pmx-mui';
export interface DateRangeObj {
  startDate: string;
  endDate: string;
  valid: boolean;
}

interface ChildProps {
  onDateChange: (dateRange: DateRangeObj) => void;
  message: string;
  fiscalStart?: boolean;
  label?: string;
}

const PmxDateRangeTabHeader = ({
  onDateChange,
  message,
  fiscalStart = false,
  label = 'Reporting Period',
}: ChildProps) => {
  // State for start and end dates
  const octFirst = dayjs().month(9).date(1);
  const fiscalDate = dayjs().isBefore(octFirst) ? octFirst.subtract(1, 'year') : octFirst;

  const [startDate, setStartDate] = useState<Dayjs | null>(fiscalStart ? fiscalDate : dayjs().subtract(12, 'month'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [validDateRange, setValidDateRange] = useState<boolean>(true);

  useEffect(() => {
    const dateRange = {
      startDate: startDate
        ? startDate.subtract(1, 'month').date(16).format('YYYY-MM-DD')
        : dayjs().subtract(12, 'month').date(16).format('YYYY-MM-DD'),
      endDate: endDate ? endDate.date(15).format('YYYY-MM-DD') : dayjs().date(15).format('YYYY-MM-DD'),
      valid: validDateRange,
    };

    onDateChange(dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate, startDate, validDateRange]);

  // Views for the date picker
  const views: Array<'day' | 'month' | 'year'> = ['month', 'year'];

  return (
    <Box>
      <Box component="section" id="equipment-tab-heading">
        <Typography variant="body1" sx={{ mb: 4 }}>
          {message}
        </Typography>
      </Box>
      <Stack direction={'row'} alignItems="center">
        <DualDateRangePicker
          label={label}
          defaultStartDate={startDate}
          defaultEndDate={endDate}
          onDateRangeChange={(valid, start, end) => {
            setValidDateRange(valid);
            setStartDate(start);
            setEndDate(end);
          }}
          disableFuture={true}
          views={views}
          format="MM/YYYY"
        />

        <Tooltip
          placement={'top'}
          title={
            <Typography variant="body3">
              A reporting period month occurs from the 16th of the month before to the 15th of the selected month
            </Typography>
          }
        >
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default PmxDateRangeTabHeader;
