import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { Box, useTheme } from '@mui/material';

import { CalenderViewEnum } from '@features/maintenance-schedule/models';
import { selectCalenderView, selectDateRanges } from '@features/maintenance-schedule/slices/maintenanceScheduleSlice';

import { useAppSelector } from '@store/hooks';

/**
 * Component to display a calendar view based on the selected view type (Annual, Monthly, Weekly).
 *
 * @returns {JSX.Element} The rendered calendar view display component.
 *
 * @example
 * <CalenderViewDisplay dateRanges={[new Date(), new Date()]} calenderView={CalenderViewEnum.MONTHLY} />
 *
 * @remarks
 * The component dynamically adjusts the scale (_MONTHS, dates, or _WEEKDAYS) based on the selected calendar view.
 * It uses the Material-UI theme for styling and color adjustments.
 */
const CalenderViewDisplay: React.FC = () => {
  const dateRanges = useAppSelector(selectDateRanges);
  const calenderView = useAppSelector(selectCalenderView);

  const _MONTHS = React.useMemo(
    () => ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    [],
  );
  const _WEEKDAYS = React.useMemo(() => ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], []);
  const daysInMonth = dateRanges ? dateRanges.map((date: dayjs.Dayjs) => date.date()) : [];
  const styles = { minWidth: '40px', textAlign: 'center' };

  const [scale, setScale] = useState<Array<number | string>>(daysInMonth);
  const theme = useTheme();

  // Sets scale based on calender view
  useEffect(() => {
    if (dateRanges && calenderView) {
      switch (calenderView) {
        case CalenderViewEnum.ANNUAL:
          setScale(_MONTHS);
          break;
        case CalenderViewEnum.MONTHLY:
          setScale(dateRanges.map((date: dayjs.Dayjs) => date.date()));
          break;
        case CalenderViewEnum.WEEKLY:
          setScale(_WEEKDAYS);
          break;
      }
    }
  }, [dateRanges, calenderView, _MONTHS, _WEEKDAYS]);

  // Grid
  return (
    <Box
      id="calender-layout-right-scale"
      data-testid="calender-layout-right-scale"
      sx={{ display: 'grid', gridTemplateColumns: `repeat(${scale.length}, 1fr)` }}
    >
      {
        // Grid columns
        calenderView === CalenderViewEnum.ANNUAL
          ? _MONTHS.map((month) => (
              <Box
                key={`calender-scale-col-${month}`}
                id={`calender-scale-col-${month}`}
                data-testid={`calender-scale-col-${month}`}
                sx={styles}
              >
                {month}
              </Box>
            ))
          : // Maps Monthly or Weekly dates to days
            dateRanges?.map((date: dayjs.Dayjs, index: number) => (
              <Box
                key={`calender-scale-col-${date.date()}`}
                id={`calender-scale-col-${date.date()}`}
                data-testid={`calender-scale-col-${date.date()}`}
                sx={{
                  ...styles,
                  // Styling for weekend
                  color:
                    date.day() === 0 || date.day() === 6 ? theme.palette.text.secondary : theme.palette.text.primary,
                }}
              >
                {scale[index]}
              </Box>
            ))
      }
    </Box>
  );
};

export default CalenderViewDisplay;
