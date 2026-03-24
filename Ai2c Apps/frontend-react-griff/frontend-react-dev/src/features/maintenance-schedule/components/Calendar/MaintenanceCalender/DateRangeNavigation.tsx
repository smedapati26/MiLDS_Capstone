import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, IconButton, styled } from '@mui/material';

import { Heading } from '@ai2c/pmx-mui';

import { useAppDispatch, useAppSelector } from '@store/hooks';

import { CalenderViewEnum } from '../../../models/CalenderViewEnum';
import { selectCalenderView, selectDateRanges, setDateRanges } from '../../../slices/maintenanceScheduleSlice';

/*
 * A styled IconButton component that customizes the font size to 30px.
 */
const StyledIconButton = styled(IconButton)(() => ({
  '& .MuiSvgIcon-root': { fontSize: '30px' },
}));

/**
 * DateRangeNavigation component allows users to navigate through different date ranges
 * (annual, monthly, weekly) and displays the current date range in a formatted text.
 */
const DateRangeNavigation: React.FC = () => {
  const dateRanges = useAppSelector(selectDateRanges);
  const calenderView = useAppSelector(selectCalenderView);
  const dispatch = useAppDispatch();

  const [displayText, setDisplayText] = useState<string>('');

  // Sets display text & formatting based on calender view
  useEffect(() => {
    if (dateRanges) {
      switch (calenderView) {
        case CalenderViewEnum.ANNUAL:
          setDisplayText(dateRanges[0].year().toString());
          break;
        case CalenderViewEnum.MONTHLY:
          setDisplayText(dateRanges[0].format('MMMYY').toUpperCase().toString());
          break;
        case CalenderViewEnum.WEEKLY:
          setDisplayText(
            `${dateRanges[0].format('DDMMMYY').toUpperCase()} - ${dateRanges[0].add(1, 'week').format('DDMMMYY').toUpperCase()}`,
          );
          break;
      }
    }
  }, [dateRanges, calenderView]);

  const handleDateNavigationChange = (type: 'prev' | 'next') => {
    if (dateRanges) {
      const increment = calenderView as dayjs.ManipulateType;
      const date = type === 'prev' ? dateRanges[0].subtract(1, increment) : dateRanges[0].add(1, increment);
      dispatch(setDateRanges(date.startOf(increment), date.endOf(increment)));
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginLeft: '-5px',
      }}
    >
      <StyledIconButton onClick={() => handleDateNavigationChange('prev')}>
        <ChevronLeftIcon />
      </StyledIconButton>
      <Heading variant="h6" sx={{ display: 'inline', marginBottom: 0 }}>
        {displayText}
      </Heading>
      <StyledIconButton onClick={() => handleDateNavigationChange('next')}>
        <ChevronRightIcon />
      </StyledIconButton>
    </Box>
  );
};

export default DateRangeNavigation;
