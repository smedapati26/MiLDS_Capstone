import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';

import { QUERY_DATE_FORMAT } from '@utils/constants';

import { useAppSelector } from '@store/hooks';

import EquipmentDetailsGridItem from '../components/EquipmentDetails/EquipmentDetailsGridItem';
import FlyingHoursGridItem from '../components/FlyingHours/FlyingHoursGridItem';
import LaunchStatusGridItem from '../components/LaunchStatusGridItem';
import MaintenanceDetailsGridItem from '../components/MaintenanceDetails/MaintenanceDetailsGridItem';
import MaintenanceStatusGridItem from '../components/MaintenanceStatusGridItem';
import OperationalReadinessStatusGridItem from '../components/OperationalReadinessStatus/OperationalReadinessStatusGridItem';

/**
 * Unit Functional Component
 */
export const Unit: React.FC = () => {
  const currentUic = useAppSelector((state) => state.appSettings.currentUic);
  const startDate = dayjs().startOf('month').format(QUERY_DATE_FORMAT);
  const endDate = dayjs().endOf('month').format(QUERY_DATE_FORMAT);

  // Fetch status over time data
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={4} alignItems="stretch">
        {/* Operational Readiness Status */}
        <Grid xs={12} lg={9}>
          <OperationalReadinessStatusGridItem uic={currentUic} startDate={startDate} endDate={endDate} />
        </Grid>

        {/* Launch Status */}
        <Grid xs={6} lg={3}>
          <LaunchStatusGridItem uic={currentUic} startDate={startDate} endDate={endDate} />
        </Grid>

        {/* Maintenance Status */}
        <Grid xs={6} lg={3}>
          <MaintenanceStatusGridItem uic={currentUic} />
        </Grid>

        {/* Flying Hours */}
        <Grid xs={12} lg={9}>
          <FlyingHoursGridItem uic={currentUic} />
        </Grid>

        {/* Equipment Details */}
        <Grid xs={12}>
          <EquipmentDetailsGridItem uic={currentUic} startDate={startDate} endDate={endDate} />
        </Grid>

        {/* Maintenance Details */}
        <Grid xs={12}>
          <MaintenanceDetailsGridItem uic={currentUic} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Unit;
