// Import necessary Material-UI components and hooks
import { Divider, Typography, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

// Import custom components and API hooks
import PmxGridItemTemplate from '@components/PmxGridItemTemplate';

import { useGetAutoDsrQuery } from '@store/griffin_api/auto_dsr/slices';

/* Launch Status Props */
export type LaunchStatusProps = {
  label: string; // Display label for the status (RTL/NRTL)
  count?: number; // Number of aircraft in this status
  totalAircraft?: number; // Total number of aircraft for percentage calculation
};

/* Launch Status Info component */
/**
 * Displays individual launch status information with percentage and count
 * @param props LaunchStatusProps containing label, count, and total aircraft
 * @returns JSX element showing status percentage and aircraft count
 */
export const LaunchStatus: React.FC<LaunchStatusProps> = (props: LaunchStatusProps) => {
  // Destructure props with default values
  const { label, count = 0, totalAircraft = 0 } = props;
  const theme = useTheme(); // Access Material-UI theme for styling

  // Calculate percentage, avoiding division by zero
  const percentage = totalAircraft !== 0 ? Math.round((count / totalAircraft) * 100) : 0;

  return (
    <Stack spacing={3} justifyContent="space-between">
      {/* Status label (RTL or NRTL) */}
      <Typography variant="body1">{label}</Typography>

      {/* Display percentage as main metric */}
      <Typography variant="h4">{percentage}%</Typography>

      {/* Aircraft count section */}
      <Box>
        <Typography variant="body3" sx={{ color: theme.palette.text.secondary }}>
          # of aircraft
        </Typography>
        {/* Show count/total format */}
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Typography variant="h6">{count}</Typography>
          <Typography variant="h7">/</Typography>
          <Typography variant="h7">{totalAircraft}</Typography>
        </Stack>
      </Box>
    </Stack>
  );
};

/* Launch Status Grid Item Props */
export type LaunchStatusGridItemProps = {
  uic: string | undefined; // Unit Identification Code for filtering data
  startDate: string; // Start date for data query range
  endDate: string; // End date for data query range
};

/**
 * Launch Status Grid Item Component
 * @description Displays RTL (Ready to launch) & NRTL (Not ready to launch) counts & percentages
 * This component fetches aircraft data and displays launch readiness statistics in a grid format
 *
 * @param props LaunchStatusGridItemProps containing UIC and date range
 * @returns React functional component displaying launch status grid item
 */
const LaunchStatusGridItem: React.FC<LaunchStatusGridItemProps> = (props: LaunchStatusGridItemProps) => {
  // Destructure component props
  const { uic, startDate, endDate } = props;

  // Fetch aircraft status data using RTK Query hook
  // This hook automatically handles loading states, caching, and refetching
  const { data, isError, isFetching, isUninitialized, refetch } = useGetAutoDsrQuery(
    {
      uic: uic, // Filter by unit identification code
      start_date: startDate, // Query start date
      end_date: endDate, // Query end date
    },
    { skip: !uic }, // Skip API call if UIC is not provided
  );

  return (
    // Wrapper component that provides consistent grid item styling and error handling
    <PmxGridItemTemplate
      label="Launch Status" // Grid item title
      isError={isError} // Pass error state for error display
      isFetching={isFetching} // Pass loading state for loading indicator
      isUninitialized={isUninitialized || !uic} // Show uninitialized state if no UIC
      refetch={refetch} // Provide refetch function for retry functionality
      launchPath="/equipment-manager" // Navigation path for launch button
      minHeight={'208px'} // Set minimum height for consistent grid layout
    >
      {/* Main content container with horizontal layout */}
      <Stack
        direction="row" // Arrange children horizontally
        spacing={2} // Add spacing between children
        justifyContent="space-around" // Distribute space evenly
        divider={<Divider orientation="vertical" flexItem />} // Add vertical divider between sections
        flexGrow={1} // Allow container to grow and fill available space
      >
        {/* RTL (Ready to Launch) status display */}
        <LaunchStatus label="RTL" count={data?.rtl} totalAircraft={data?.totalAircraft} />

        {/* NRTL (Not Ready to Launch) status display */}
        <LaunchStatus label="NRTL" count={data?.nrtl} totalAircraft={data?.totalAircraft} />
      </Stack>
    </PmxGridItemTemplate>
  );
};

export default LaunchStatusGridItem;
