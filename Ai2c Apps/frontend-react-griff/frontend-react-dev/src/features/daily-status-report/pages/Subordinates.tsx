// Import React hooks for state management and side effects
import { useEffect, useState } from 'react';
// Import dayjs for date manipulation and formatting
import dayjs from 'dayjs';

// Import Material-UI components for layout and UI elements
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';

import { PmxToggleButtonGroup } from '@components/inputs';
import { QUERY_DATE_FORMAT } from '@utils/constants';

import { useGetAutoDsrQuery } from '@store/griffin_api/auto_dsr/slices';
import { IAutoDsrUnit } from '@store/griffin_api/auto_dsr/transforms/autoDsrTransform';
// Import Redux hooks and API slice for state management
import { useAppSelector } from '@store/hooks';

// Import grid item components for different dashboard sections
import EquipmentDetailsGridItem from '../components/EquipmentDetails/EquipmentDetailsGridItem';
import FlyingHoursGridItem from '../components/FlyingHours/FlyingHoursGridItem';
import LaunchStatusGridItem from '../components/LaunchStatusGridItem';
import MaintenanceDetailsGridItem from '../components/MaintenanceDetails/MaintenanceDetailsGridItem';
import MaintenanceStatusGridItem from '../components/MaintenanceStatusGridItem';
import OperationalReadinessStatusGridItem from '../components/OperationalReadinessStatus/OperationalReadinessStatusGridItem';

/**
 * Subordinates Page Component
 * @description Main dashboard page that displays aircraft readiness data for subordinate units
 * This component allows users to select different subordinate units and view their operational status,
 * maintenance information, flying hours, and equipment details in a grid layout.
 *
 * @returns React functional component displaying subordinate units dashboard
 */
export const Subordinates: React.FC = () => {
  // Get current UIC from Redux store - this represents the parent unit
  const currentUic = useAppSelector((state) => state.appSettings.currentUic);

  // Calculate date range for current month using dayjs
  const startDate = dayjs().startOf('month').format(QUERY_DATE_FORMAT); // First day of current month
  const endDate = dayjs().endOf('month').format(QUERY_DATE_FORMAT); // Last day of current month

  // Local state for managing subordinate units and selected unit
  const [subUnits, setSubUnits] = useState<Array<IAutoDsrUnit> | undefined>(undefined); // List of subordinate units
  const [selectedUic, setSelectedUic] = useState(''); // Currently selected subordinate unit UIC

  // Fetch aircraft data for the current parent unit
  // This will return data including all subordinate units under the current UIC
  const { data } = useGetAutoDsrQuery(
    {
      uic: currentUic, // Parent unit identifier
      start_date: startDate, // Query start date
      end_date: endDate, // Query end date
    },
    { skip: !currentUic }, // Skip API call if no UIC is selected
  );

  // Effect to initialize subordinate units and select first unit when data loads
  useEffect(() => {
    if (data) {
      // Set the first subordinate unit as selected by default
      setSelectedUic(data.units[0].uic);
      // Store all subordinate units for the toggle button group
      setSubUnits(data.units);
    }
  }, [data]); // Re-run when data changes

  return (
    // Main container with flexible growth
    <Box sx={{ flexGrow: 1 }}>
      {/* Grid container with consistent spacing between items */}
      <Grid container spacing={4}>
        {/* Unit Selection Toggle Buttons - Full width row */}
        <Grid xs={12}>
          <PmxToggleButtonGroup
            value={selectedUic}
            options={!subUnits ? [] : subUnits?.map((unit) => ({ label: unit.name, value: unit.uic }))}
            onChange={(value) => setSelectedUic(value || '')}
          />
        </Grid>

        {/* Operational Readiness Status - Large grid item (9/12 columns on large screens) */}
        <Grid xs={12} lg={9}>
          <OperationalReadinessStatusGridItem
            uic={selectedUic} // Pass selected UIC for data filtering
            startDate={startDate} // Date range start
            endDate={endDate} // Date range end
          />
        </Grid>

        {/* Launch Status - Small grid item (3/12 columns on large screens, 6/12 on small) */}
        <Grid xs={6} lg={3}>
          <LaunchStatusGridItem
            uic={selectedUic} // Pass selected UIC for data filtering
            startDate={startDate} // Date range start
            endDate={endDate} // Date range end
          />
        </Grid>

        {/* Maintenance Status - Small grid item (3/12 columns on large screens, 6/12 on small) */}
        <Grid xs={6} lg={3}>
          <MaintenanceStatusGridItem
            uic={selectedUic} // Pass selected UIC for data filtering
          />
        </Grid>

        {/* Flying Hours - Large grid item (9/12 columns on large screens) */}
        <Grid xs={12} lg={9}>
          <FlyingHoursGridItem
            uic={selectedUic} // Pass selected UIC for data filtering
            higherEchelonUic={currentUic}
          />
        </Grid>

        {/* Equipment Details - Full width grid item */}
        <Grid xs={12}>
          <EquipmentDetailsGridItem uic={selectedUic} startDate={startDate} endDate={endDate} />
        </Grid>

        {/* Maintenance Details - Full width grid item */}
        <Grid xs={12}>
          <MaintenanceDetailsGridItem uic={selectedUic} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Subordinates;
