import React, { useState } from 'react';

import { Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

import { DateRangeObj } from '@components/inputs/PmxDateRangeTabHeader';
import PmxCarousel from '@components/PmxCarousel';
import CompareUnitBarChart from '@features/flight-hour-program/overview/CompareUnitBarChart';
import FlightSummaryModelCarousel from '@features/flight-hour-program/overview/FlightSummaryModelCarousel';
import ModelPredictionBarChart from '@features/flight-hour-program/overview/ModelPredictionBarChart';
import SummaryBarChart from '@features/flight-hour-program/overview/SummaryBarChart';

import { useGetFhpProgressQuery } from '@store/griffin_api/fhp/slices';
import { useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';

type SummaryType = 'unit' | 'model';

interface Props {
  dateRange: DateRangeObj | null;
}

/**
 * Carousel showing graphs in Flight Hour Summary section of Fhp page
 * @param {number} props.dateRange for the progress data date range
 * @returns
 */

const FlightSummaryCarousel: React.FC<Props> = (props: Props): React.ReactNode => {
  const globalUic = useAppSelector(selectCurrentUic);
  const { dateRange } = props;
  const [summaryType, setSummaryType] = useState<SummaryType>('unit');
  const { data, isLoading, isFetching } = useGetFhpProgressQuery(
    {
      uic: globalUic,
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate,
    },
    { skip: !globalUic || !dateRange || !dateRange?.valid },
  );

  const handleToggle = (_event: React.MouseEvent<HTMLElement>, newValue: SummaryType) => {
    if (newValue) {
      setSummaryType(newValue);
    }
  };

  if (isLoading || isFetching) {
    return (
      <Skeleton data-testid="skeleton-fhp-summary-carousel-loading" variant="rectangular" width="100%" height={50} />
    );
  }

  return (
    <Stack direction="column" data-testid="fhp-summary-carousel">
      <Typography variant="h6" mb={4}>
        Flight Hour Summary
      </Typography>
      <ToggleButtonGroup
        color="primary"
        value={summaryType}
        onChange={handleToggle}
        aria-label="fhp-summary-toggle"
        data-testid="fhp-summary-toggle"
        sx={{ mb: '10px' }}
        exclusive
      >
        <ToggleButton value={'unit' as SummaryType}>unit</ToggleButton>
        <ToggleButton value={'model' as SummaryType}>model</ToggleButton>
      </ToggleButtonGroup>
      {data &&
        (summaryType === 'unit' ? (
          <PmxCarousel maxVisible={1}>
            <SummaryBarChart data={data} height={441} />
            <CompareUnitBarChart
              data={data}
              startDate={dateRange?.startDate as string}
              endDate={dateRange?.endDate as string}
              height={356}
            />
            <ModelPredictionBarChart data={data} height={441} />
          </PmxCarousel>
        ) : (
          <FlightSummaryModelCarousel data={data} height={356} />
        ))}
    </Stack>
  );
};

export default FlightSummaryCarousel;
