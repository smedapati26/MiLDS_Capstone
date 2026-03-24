/**
 * MaintenanceStatusGridItem Component
 *
 * This component displays maintenance status information in a grid item format,
 * specifically showing Bank Time data with a gauge visualization and projected
 * difference indicators for the next period.
 */

import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import { Box, useTheme } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { PmxGauge } from '@components/PmxGauge';
import PmxGridItemTemplate from '@components/PmxGridItemTemplate';

import { useBankTimeForecast } from '../hooks/useBankTimeForecast';

/**
 * Utility function to format projected difference with appropriate sign and icon
 *
 * This function takes a numeric difference value and returns a formatted JSX element
 * with the appropriate trend icon and sign prefix.
 *
 * @param difference - The projected difference value (positive or negative number)
 * @returns JSX element with icon and formatted text
 *
 * @example
 * prefixSign(5) // Returns: <NorthEastIcon /> +5%
 * prefixSign(-3) // Returns: <SouthEastIcon /> -3%
 */
export const prefixSign = (difference: number) => {
  // Handle positive differences - show upward trend icon with + prefix
  if (difference > 0) {
    return (
      <>
        <NorthEastIcon fontSize="small" sx={{ mb: '-5px' }} /> {` +${difference}%`}
      </>
    );
  } else {
    // Handle negative/zero differences - show downward trend icon without + prefix
    return (
      <>
        <SouthEastIcon fontSize="small" sx={{ mb: '-5px' }} />
        {` ${difference}%`}
      </>
    );
  }
};

/**
 * MaintenanceStatusGridItem Component
 *
 * A React functional component that displays Bank Time projections in a gauge graph
 * format within a grid item template. This component shows current bank time percentage
 * and projected difference for the next period with visual trend indicators.
 *
 * Features:
 * - Displays bank time data using a circular gauge
 * - Shows projected difference with appropriate trend icons
 * - Handles loading, error, and uninitialized states
 * - Provides navigation to detailed flight hour program view
 *
 * @param uic { string } // Used to make DSR api call
 * @returns React functional component
 */
const MaintenanceStatusGridItem: React.FC<{ uic: string }> = ({ uic }: { uic: string }) => {
  // Access Material-UI theme for consistent styling
  const theme = useTheme();

  // Fetch bank time forecast data using custom hook
  // Destructure all necessary state values and functions
  const { percentage, projectedDifference, isError, isFetching, isUninitialized, refetch } = useBankTimeForecast(uic);

  return (
    // Wrap content in grid item template for consistent layout and error handling
    <PmxGridItemTemplate
      label="Maintenance Status" // Grid item title
      isError={isError} // Pass error state for error display
      isFetching={isFetching} // Pass loading state for loading indicator
      isUninitialized={isUninitialized} // Pass uninitialized state
      refetch={refetch} // Pass refetch function for retry functionality
      launchPath="/maintenance-schedule" // Navigation path for detailed view
      minHeight="220px"
    >
      {/* Main content container using vertical stack layout */}
      <Stack>
        {/* Bank Time label */}
        <Typography variant="body2" sx={{ mb: 2 }}>
          Bank Time
        </Typography>

        {/* Gauge container with negative top margin for visual adjustment */}
        <Box sx={{ mt: -8 }}>
          <PmxGauge
            showAs="percentage" // Display format as percentage
            value={percentage} // Current bank time percentage value
            data-testid="maintenance-status-bank-time-gauge" // Test identifier
          />
        </Box>

        {/* Projection information container - horizontal layout */}
        <Stack direction="row" justifyContent="center" alignItems="flex-end" sx={{ mt: 1 }}>
          {/* Projected difference with trend icon */}
          <Typography variant="body1" sx={{ pr: 2 }}>
            {prefixSign(projectedDifference)}
          </Typography>

          {/* Projection period label with secondary text color */}
          <Typography variant="body3" sx={{ color: theme.palette.text.secondary }}>
            projection for next period
          </Typography>
        </Stack>
      </Stack>
    </PmxGridItemTemplate>
  );
};

export default MaintenanceStatusGridItem;
