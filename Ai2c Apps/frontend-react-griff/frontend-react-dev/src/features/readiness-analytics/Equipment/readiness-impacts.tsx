import React, { useMemo } from 'react';

import { Card, Stack, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';

import PmxAccordionItemTemplate from '@components/PmxAccordionItemTemplate';

import { useGetInexperiencedPersonnelQuery, useGetUnavailablePersonnelQuery } from '@store/amap_api/personnel/slices';
import { useGetMaintenanceSchedulerQuery } from '@store/griffin_api/events/slices';

// Define the props for the RenderData component
interface RenderDataProps {
  data: unknown[] | undefined;
}

// RenderData component to display the data
const RenderData: React.FC<RenderDataProps> = ({ data }) => {
  const theme = useTheme();

  if (data?.length) {
    return (
      <Stack spacing={3}>
        {(data as { [key: string]: unknown }[])?.map((item) => (
          <Card
            key={Object.values(item).join(', ')}
            sx={{
              padding: theme.spacing(3),
              border: 'none',
            }}
          >
            <Typography variant="body2">{Object.values(item).join(', ')}</Typography>
          </Card>
        ))}
      </Stack>
    );
  }
  return null;
};

const ReadinessImpacts: React.FC<{
  uic: string;
  start_date: string;
  end_date: string;
  validDateRange: boolean;
}> = ({ uic, start_date, end_date, validDateRange }) => {
  // Fetch maintenance scheduler data
  const {
    data: maintenanceData,
    isError: maintenanceError,
    isFetching: maintenanceFetching,
    refetch: maintenanceRefetch,
  } = useGetMaintenanceSchedulerQuery({ uic, start_date, end_date }, { skip: !validDateRange });

  // Fetch inexperienced personnel data
  const {
    data: inexperiencedData,
    isError: inexperiencedError,
    isFetching: inexperiencedFetching,
    refetch: inexperiencedRefetch,
  } = useGetInexperiencedPersonnelQuery({ uic, start_date, end_date }, { skip: !validDateRange });

  // Fetch unavailable personnel data
  const {
    data: unavailableData,
    isError: unavailableError,
    isFetching: unavailableFetching,
    refetch: unavailableRefetch,
  } = useGetUnavailablePersonnelQuery({ uic, start_date, end_date }, { skip: !validDateRange });

  // Calculate totals using reduce wrapped in useMemo
  const totalScheduled = useMemo(
    () => maintenanceData?.scheduled?.reduce((acc, item) => acc + item.scheduled, 0) ?? 0,
    [maintenanceData?.scheduled],
  );
  const totalUnscheduled = useMemo(
    () => maintenanceData?.unscheduled?.reduce((acc, item) => acc + item.unscheduled, 0) ?? 0,
    [maintenanceData?.unscheduled],
  );
  const totalInexperienced = useMemo(
    () => inexperiencedData?.reduce((acc, item) => acc + item.count, 0) ?? 0,
    [inexperiencedData],
  );
  const totalUnavailable = useMemo(
    () => unavailableData?.reduce((acc, item) => acc + item.count, 0) ?? 0,
    [unavailableData],
  );

  return (
    <Stack gap={3}>
      {/* Render scheduled maintenance data */}
      <PmxAccordionItemTemplate
        title="Scheduled Maintenance"
        total={totalScheduled}
        isError={maintenanceError}
        isFetching={maintenanceFetching}
        refetch={maintenanceRefetch}
      >
        <RenderData data={maintenanceData?.scheduled} />
      </PmxAccordionItemTemplate>

      {/* Render unscheduled maintenance data */}
      <PmxAccordionItemTemplate
        title="Unscheduled Maintenance"
        total={totalUnscheduled}
        isError={maintenanceError}
        isFetching={maintenanceFetching}
        refetch={maintenanceRefetch}
      >
        <RenderData data={maintenanceData?.unscheduled} />
      </PmxAccordionItemTemplate>

      {/* Render inexperienced personnel data */}
      <PmxAccordionItemTemplate
        title="Inexperienced Personnel"
        total={totalInexperienced}
        isError={inexperiencedError}
        isFetching={inexperiencedFetching}
        refetch={inexperiencedRefetch}
      >
        <RenderData data={inexperiencedData} />
      </PmxAccordionItemTemplate>

      {/* Render unavailable personnel data */}
      <PmxAccordionItemTemplate
        title="Unavailable Personnel"
        total={totalUnavailable}
        isError={unavailableError}
        isFetching={unavailableFetching}
        refetch={unavailableRefetch}
      >
        <RenderData data={unavailableData} />
      </PmxAccordionItemTemplate>
    </Stack>
  );
};

export default ReadinessImpacts;
