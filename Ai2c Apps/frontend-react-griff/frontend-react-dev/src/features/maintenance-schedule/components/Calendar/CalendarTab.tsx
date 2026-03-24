import React, { useEffect, useState } from 'react';

import { Skeleton, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { ScrollableLayout } from '@ai2c/pmx-mui';

import PmxGridItemTemplate from '@components/PmxGridItemTemplate';
import {
  BankTimeChart,
  MaintenanceCalender,
  PhaseDetailsTable,
  VerticalToolbar,
} from '@features/maintenance-schedule/components/Calendar';
import { selectToday } from '@features/maintenance-schedule/slices';
import { QUERY_DATE_FORMAT } from '@utils/constants';

import { useGetBankTimeQuery } from '@store/griffin_api/auto_dsr/slices';
import { IMaintenanceEvent } from '@store/griffin_api/events/models';
import { useGetMaintenanceQuery, useGetUpcomingMaintenanceQuery } from '@store/griffin_api/events/slices';
import { useAppSelector } from '@store/hooks';

/**
 * MaintenanceSchedulePage component is responsible for rendering the maintenance schedule page.
 * It fetches maintenance calendar data and displays it in a calendar view along with additional
 * sections for bank time and phase details.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * <MaintenanceSchedulePage />
 *
 * @remarks
 * This component uses the `useGetMaintenanceCalenderQuery` hook to fetch calendar data and updates
 * the state with lanes and events. It also sets graph colors based on the theme palette.
 *
 * @dependencies
 * - dayjs
 * - useTheme
 */
const MaintenanceCalendarTab: React.FC = () => {
  const [events, setEvents] = useState<Array<IMaintenanceEvent>>([]);
  const today = useAppSelector(selectToday);
  const theme = useTheme();
  const uic = useAppSelector((state) => state.appSettings.currentUic);

  // Maintenance Event Api Query
  const { data: maintenanceData, isSuccess } = useGetMaintenanceQuery(
    {
      uic: uic,
      startDate: today.startOf('month').format(QUERY_DATE_FORMAT),
      endDate: today.endOf('month').format(QUERY_DATE_FORMAT),
    },
    { skip: !uic },
  );

  const {
    data: bankTimeData,
    isError: isBankTimeError,
    isFetching: isBankTimeFetching,
    isUninitialized: isBankTimeUninitialized,
    refetch: refetchBankTime,
  } = useGetBankTimeQuery({ uic: uic }, { skip: !uic });

  const {
    data: upcomingMaintenanceData,
    isError: isUpcomingMaintenanceError,
    isFetching: isUpcomingMaintenanceFetching,
    isUninitialized: isUpcomingMaintenanceUninitialized,
    refetch: refetchUpcomingMaintenance,
  } = useGetUpcomingMaintenanceQuery(
    {
      uic: uic,
      event_end: today.format(QUERY_DATE_FORMAT),
      is_phase: true,
    },
    { skip: !uic },
  );

  // Mapping the events to colors and creating aircraft models array
  useEffect(() => {
    if (maintenanceData && theme.palette.graph) {
      const aircraftModels: Array<string> = [];
      const graphColors = Object.values(theme.palette.graph);

      const newEvents = maintenanceData.map((event: IMaintenanceEvent) => {
        const model = event.aircraft.model;
        if (!aircraftModels.includes(model)) {
          aircraftModels.push(model);
        }
        return { ...event, color: graphColors[aircraftModels.indexOf(model)] };
      });
      setEvents(newEvents);
    }
  }, [maintenanceData, theme.palette.graph]);

  return (
    <ScrollableLayout data-testid="ms-calendar-tab-container">
      <Box data-testid="ms-calender-section" display="flex" justifyContent="stretch" flexDirection="row">
        {isSuccess ? (
          <>
            <MaintenanceCalender events={events} />
            <VerticalToolbar />
          </>
        ) : (
          <Skeleton width="100%" />
        )}
      </Box>
      <Stack direction="row" gap={3}>
        <Box data-testid="ms-bank-time-section" className="hidden-scroll" height="475px" width="50%">
          <PmxGridItemTemplate
            label="Bank Time"
            isError={isBankTimeError}
            isFetching={isBankTimeFetching}
            refetch={refetchBankTime}
            isUninitialized={isBankTimeUninitialized}
          >
            <BankTimeChart data={bankTimeData || []} />
          </PmxGridItemTemplate>
        </Box>
        <Box data-testid="ms-phase-details-section" sx={{ overflow: 'hidden', maxHeight: '100%', maxWidth: '50%' }}>
          <PmxGridItemTemplate
            label="Phase Details"
            isError={isUpcomingMaintenanceError}
            isFetching={isUpcomingMaintenanceFetching}
            isUninitialized={isUpcomingMaintenanceUninitialized}
            refetch={refetchUpcomingMaintenance}
          >
            <PhaseDetailsTable data={upcomingMaintenanceData || []} />
          </PmxGridItemTemplate>
        </Box>
      </Stack>
    </ScrollableLayout>
  );
};

export default MaintenanceCalendarTab;
