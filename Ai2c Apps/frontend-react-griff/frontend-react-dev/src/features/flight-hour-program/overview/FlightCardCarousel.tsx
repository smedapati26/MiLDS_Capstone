import React from 'react';

import { Box, Skeleton, Typography } from '@mui/material';

import { DateRangeObj } from '@components/inputs/PmxDateRangeTabHeader';
import PmxCarousel from '@components/PmxCarousel';
import FlightCard from '@features/flight-hour-program/overview/components/FlightCard';

import { IFhpSummaryDetails } from '@store/griffin_api/fhp/models';
import { useGetFhpSummaryQuery } from '@store/griffin_api/fhp/slices';
import { useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';

interface Props {
  dateRange: DateRangeObj;
}

/**
 * Carousel component to show flight hours summary cards
 * @param {object} props prop object
 * @param {DateRangeObj} props.dateRange date selected by user
 * @returns react node
 */
const FlightCardCarousel: React.FC<Props> = (props: Props): React.ReactNode => {
  const { dateRange } = props;
  const globalUic = useAppSelector(selectCurrentUic);

  const { data, isLoading, isFetching } = useGetFhpSummaryQuery(
    {
      uic: globalUic,
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate,
    },
    { skip: !globalUic || !dateRange || !dateRange?.valid },
  );

  if (isLoading || isFetching) {
    return <Skeleton data-testid="skeleton-fhp-card-carousel-loading" variant="rectangular" width="100%" height={50} />;
  }

  return (
    <Box data-testid="fhp-flight-summary-carousel">
      <PmxCarousel>
        {data ? (
          Object.entries(data).map(([key, value], index) => (
            <FlightCard key={`${key}-${index}`} title={key} data={value as IFhpSummaryDetails} />
          ))
        ) : (
          <Typography variant="body2">No Flight Hours Program data found</Typography>
        )}
      </PmxCarousel>
    </Box>
  );
};

export default FlightCardCarousel;
