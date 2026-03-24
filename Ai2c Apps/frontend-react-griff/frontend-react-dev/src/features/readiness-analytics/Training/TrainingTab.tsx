import React, { useState } from 'react';

import { Box, Container, Grid } from '@mui/material';

import PmxGridItemTemplate from '@components/PmxGridItemTemplate';

import {
  useGetHoursFlownUnitsQuery,
  useGetMissionsFlownQuery,
  useGetMissionsFlownSummaryQuery,
} from '@store/griffin_api/readiness/slices';
import { useAppSelector } from '@store/hooks';

import HoursFlown from './HoursFlown/HoursFlown';
import MissionsFlownGraph from './MissionsFlownGraph/MissionsFlownGraph';
import MissionTypesFlown from './MissionTypesFlown/MissionTypesFlown';

import PmxDateRangeTabHeader, { DateRangeObj } from '../../../components/inputs/PmxDateRangeTabHeader';

const TrainingTab: React.FC = () => {
  const [dateRangeObj, setDateRangeObj] = useState<DateRangeObj | null>(null);

  // UIC code
  const uic = useAppSelector((state) => state.appSettings.currentUic);

  // query for hours flown data
  const {
    isError: isHoursFlownError,
    isFetching: isHoursFlownFetching,
    isUninitialized: isHoursFlownUninitialized,
    refetch: refetchHoursFlown,
  } = useGetHoursFlownUnitsQuery(
    { uic, start_date: dateRangeObj?.startDate, end_date: dateRangeObj?.endDate },
    { skip: !dateRangeObj?.valid },
  );

  // Query for missions flown summary data
  const {
    data: missionsFlownSummaryData,
    isError: isMissionsFlownSummaryError,
    isFetching: isMissionsFlownSummaryFetching,
    isUninitialized: isMissionsFlownSummaryUninitialized,
    refetch: refetchMissionsFlownSummary,
  } = useGetMissionsFlownSummaryQuery(
    { uic, start_date: dateRangeObj?.startDate, end_date: dateRangeObj?.endDate },
    { skip: !dateRangeObj?.valid },
  );

  // Query for missions flown data
  const {
    data: missionsFlownData,
    isError: isMissionsFlownError,
    isFetching: isMissionsFlownFetching,
    isUninitialized: isMissionsFlownUninitialized,
    refetch: refetchMissionsFlown,
  } = useGetMissionsFlownQuery(
    { uic, start_date: dateRangeObj?.startDate, end_date: dateRangeObj?.endDate },
    { skip: !dateRangeObj?.valid },
  );

  return (
    <>
      <PmxDateRangeTabHeader
        onDateChange={($event) => setDateRangeObj($event)}
        message="Select a date range to view the unit's readiness overview."
      />
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          border: 'none',
          boxShadow: 'none',
          backgroundColor: 'transparent',
        }}
      >
        <Grid container spacing={4}>
          <Grid item id="training-tab-hours-flown" component="section" xs={8}>
            <Box className="hidden-scroll" sx={{ height: '882px', maxHeight: '882px' }}>
              <PmxGridItemTemplate
                label="Hours Flown"
                isError={isHoursFlownError}
                isFetching={isHoursFlownFetching}
                isUninitialized={isHoursFlownUninitialized}
                refetch={refetchHoursFlown}
              >
                <HoursFlown
                  uic={uic}
                  start_date={dateRangeObj?.startDate || ''}
                  end_date={dateRangeObj?.endDate || ''}
                  validDateRange={dateRangeObj?.valid || false}
                />
              </PmxGridItemTemplate>
            </Box>
          </Grid>
          <Grid id="training-tab-mission-types-flown" component="section" item xs={4}>
            <Box className="hidden-scroll" sx={{ height: '882px', maxHeight: '882px' }}>
              <PmxGridItemTemplate
                label="Types of Missions Flown"
                isError={isMissionsFlownSummaryError}
                isFetching={isMissionsFlownSummaryFetching}
                isUninitialized={isMissionsFlownSummaryUninitialized}
                refetch={refetchMissionsFlownSummary}
              >
                <MissionTypesFlown
                  data={missionsFlownSummaryData ?? []}
                  uic={uic}
                  start_date={dateRangeObj?.startDate ?? ''}
                  end_date={dateRangeObj?.endDate ?? ''}
                  validDateRange={dateRangeObj?.valid ?? false}
                />
              </PmxGridItemTemplate>
            </Box>
          </Grid>
          <Grid id="training-tab-mission-flown" component="section" item xs={12}>
            <Box className="hidden-scroll" sx={{ height: '532px', maxHeight: '532px' }}>
              <PmxGridItemTemplate
                label="Missions Flown"
                isError={isMissionsFlownError}
                isFetching={isMissionsFlownFetching}
                isUninitialized={isMissionsFlownUninitialized}
                refetch={refetchMissionsFlown}
              >
                <MissionsFlownGraph data={Array.isArray(missionsFlownData) ? missionsFlownData : undefined} />
              </PmxGridItemTemplate>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default TrainingTab;
