import { useState } from 'react';

import { Box, Container, Grid } from '@mui/material';

import PmxGridItemTemplate from '@components/PmxGridItemTemplate';

import { useGetMaintenanceSchedulerQuery } from '@store/griffin_api/events/slices';
// import { useGetFaultsOverTimeQuery } from '@store/griffin_api/faults/slices';
import { useGetStatusOverTimeQuery } from '@store/griffin_api/readiness/slices';
import { useAppSelector } from '@store/hooks';

// import FaultsOverTime from './FaultsOverTime/faults-over-time';
import StatusOverTimeChart from './StatusOverTime/StatusOverTimeChart';

import PmxDateRangeTabHeader, { DateRangeObj } from '../../../components/inputs/PmxDateRangeTabHeader';
// import MaintenanceTime from './maintenance-time';
// import ReadinessImpacts from './readiness-impacts';

const EquipmentTab: React.FC = () => {
  const uic = useAppSelector((state) => state.appSettings.currentUic);
  const [dateRangeObj, setDateRangeObj] = useState<DateRangeObj | null>(null);

  // Fetch status over time data
  const statusOverTimeQuery = useGetStatusOverTimeQuery(
    {
      uic,
      start_date: dateRangeObj?.startDate,
      end_date: dateRangeObj?.endDate,
    },
    { skip: !dateRangeObj?.valid },
  );

  const maintenanceSchedulerQuery = useGetMaintenanceSchedulerQuery(
    {
      uic,
      start_date: dateRangeObj?.startDate,
      end_date: dateRangeObj?.endDate,
    },
    { skip: !dateRangeObj?.valid },
  );

  // Combine queries for Status Over Time chart
  const combinedStatusOverTime = {
    data: statusOverTimeQuery.data ?? [],
    unscheduledMaintenanceData: maintenanceSchedulerQuery.data?.unscheduled ?? [],
    isError: statusOverTimeQuery.isError || maintenanceSchedulerQuery.isError,
    isFetching: statusOverTimeQuery.isFetching || maintenanceSchedulerQuery.isFetching,
    isUninitialized: statusOverTimeQuery.isUninitialized || maintenanceSchedulerQuery.isUninitialized,
    refetch: () => {
      statusOverTimeQuery.refetch();
      maintenanceSchedulerQuery.refetch();
    },
  };

  // Fetch faults over time data
  // const {
  //   data: faultsData,
  //   isError: isFaultsError,
  //   isFetching: isFaultsFetching,
  //   isUninitialized: isFaultsUninitialized,
  //   refetch: refetchFaults,
  // } = useGetFaultsOverTimeQuery(
  //   {
  //     uic,
  //     start_date: dateRangeObj?.startDate,
  //     end_date: dateRangeObj?.endDate,
  //   },
  //   { skip: !dateRangeObj?.valid },
  // );

  return (
    <>
      <PmxDateRangeTabHeader
        onDateChange={($event) => setDateRangeObj($event)}
        message="Select a date range to view the unit's readiness overview."
      />
      <Container
        maxWidth={false}
        disableGutters
        sx={{ border: 'none', boxShadow: 'none', backgroundColor: 'transparent' }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Box
              className="hidden-scroll"
              sx={{
                height: '523px',
                maxHeight: '523px',
              }}
            >
              <PmxGridItemTemplate
                label="Status Over Time"
                isError={combinedStatusOverTime.isError}
                isFetching={combinedStatusOverTime.isFetching}
                isUninitialized={combinedStatusOverTime.isUninitialized}
                refetch={combinedStatusOverTime.refetch}
              >
                <StatusOverTimeChart
                  data={combinedStatusOverTime.data}
                  unscheduledMaintenanceData={combinedStatusOverTime.unscheduledMaintenanceData}
                />
              </PmxGridItemTemplate>
            </Box>
          </Grid>
          {/* <Grid item xs={9} mb={2}>
            <Box className="hidden-scroll" sx={{ height: '601px', maxHeight: '601px' }}>
              <PmxGridItemTemplate
                label="Fault Over Time"
                isError={isFaultsError}
                isFetching={isFaultsFetching}
                isUninitialized={isFaultsUninitialized}
                refetch={refetchFaults}
              >
                <FaultsOverTime data={faultsData ?? []} />
              </PmxGridItemTemplate>
            </Box>
          </Grid>
          <Grid item xs={3} mb={2}>
            <Stack spacing={4} sx={{ height: '601px' }}>
              <Box className="hidden-scroll" maxHeight="586px" height="586px">
                <PmxGridItemTemplate
                  label="Readiness Impact"
                  isError={false}
                  isFetching={false}
                  isUninitialized={false}
                  refetch={() => {}}
                >
                  <ReadinessImpacts
                    uic={uic}
                    start_date={dateRangeObj?.startDate ?? ''}
                    end_date={dateRangeObj?.endDate ?? ''}
                    validDateRange={dateRangeObj?.valid ?? false}
                  />
                </PmxGridItemTemplate>
              </Box>
              <Box className="hidden-scroll" maxHeight="244px" height="244px">
                <PmxGridItemTemplate
                  label="Maintenance Time"
                  isError={false}
                  isFetching={false}
                  isUninitialized={false}
                  refetch={() => {}}
                >
                  <MaintenanceTime data={''} />
                </PmxGridItemTemplate>
              </Box>
            </Stack>
          </Grid> */}
        </Grid>
      </Container>
    </>
  );
};

export default EquipmentTab;
