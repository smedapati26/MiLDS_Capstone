import React, { useState } from 'react';

import { Stack } from '@mui/material';

import PmxDateRangeTabHeader, { DateRangeObj } from '@components/inputs/PmxDateRangeTabHeader';
import FlightCardCarousel from '@features/flight-hour-program/overview/FlightCardCarousel';
import FlightSummaryCarousel from '@features/flight-hour-program/overview/FlightSummaryCarousel';

/**
 * Overview flight hour program Tab
 * @returns React Node component
 */
const OverviewTab: React.FC = (): React.ReactNode => {
  const [dateRangeObj, setDateRangeObj] = useState<DateRangeObj | null>(null);

  return (
    <Stack direction="column" data-testid="fhp-overview-tab">
      <PmxDateRangeTabHeader
        onDateChange={($event) => setDateRangeObj($event)}
        message="Report will show fiscal year to date until a date range is selected."
        label="Date"
        fiscalStart
      />
      <Stack direction="column" spacing={9}>
        <FlightCardCarousel dateRange={dateRangeObj as DateRangeObj} />
        <FlightSummaryCarousel dateRange={dateRangeObj} />
      </Stack>
    </Stack>
  );
};

export default OverviewTab;
