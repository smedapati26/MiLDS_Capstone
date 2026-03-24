import InfoIcon from '@mui/icons-material/Info';
import { Box, Stack, styled, Typography, useTheme } from '@mui/material';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';

import { NumericLinearProgress } from '@ai2c/pmx-mui';

import { generateTestId } from '@utils/helpers/generateTestId';

/**
 * Props interface for the ProgressStats component
 */
interface ProgressStatsProps {
  label: string; //The label/title to display above the progress bar
  hours: number; // The current number of completed hours
  totalHours: number; // The total number of hours required for completion
}

/**
 * ProgressStats Component
 *
 * Displays a progress indicator for flying hours completion with:
 * - A labeled progress bar showing percentage completion
 * - Detailed breakdown of completed vs total hours
 * - Responsive layout using Material-UI Stack components
 *
 * @param props - The component props
 * @returns JSX element containing the progress statistics display
 */
const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500,
  },
});

export const ProgressStats: React.FC<ProgressStatsProps> = (props: ProgressStatsProps) => {
  const { label, hours, totalHours } = props;

  // Access Material-UI theme for consistent styling
  const theme = useTheme();

  // Calculate progress percentage and round to nearest whole number
  const progressPercentage = totalHours !== 0 ? Math.round((hours / totalHours) * 100) : 0;

  // Round hours for display to avoid decimal precision issues
  const displayHours = Math.round(hours);
  const displayTotalHours = Math.round(totalHours);

  return (
    <Stack
      // Generate unique test ID for automated testing
      data-testid={generateTestId(label, 'flying-hours', true)}
      spacing={6} // Consistent spacing between elements
      justifyContent="space-around" // Distribute elements evenly
      flexBasis="100%" // Take full width of parent container
    >
      {/* Progress bar label/title section */}
      {/* Progress bar label/title section */}
      <Typography
        variant="body2"
        sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'center', // Centers icon vertically with text
          gap: 1, // Adds the "little spacing" you requested (8px)
        }}
      >
        {label}
        <StyledTooltip
          title={
            <Stack direction="row" justifyContent="space-between" gap={6}>
              <Typography variant="body3" color="text.secondary">
                Flying Hours
              </Typography>
              <Typography variant="body3">
                Flying hours are calculated using DA1352 readiness data. Data for the current month will be sparse, but
                can be updated by pushing ACN data or ACD uploads. Historical data will be overwritten via AESIP
                records. Projections for your unit can be added by opening a Griffin support ticket.
              </Typography>
            </Stack>
          }
          placement="bottom"
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 8],
                  },
                },
              ],
            },
          }}
        >
          <InfoIcon
            sx={{
              fontSize: '1rem',
              cursor: 'help',
            }}
          />
        </StyledTooltip>
      </Typography>

      {/* Main progress bar displaying completion percentage */}
      <NumericLinearProgress progress={progressPercentage}></NumericLinearProgress>

      {/* Detailed hours breakdown section */}
      <Box>
        {/* Section header for completed hours display */}
        <Typography variant="body2" sx={{ pb: 3 }}>
          Completed Hours
        </Typography>

        {/* Horizontal layout for hours display: "X / Y hours flown" */}
        <Stack direction="row" spacing={2}>
          {/* Current completed hours - emphasized with larger font */}
          <Typography variant="h6">{displayHours} hours flown</Typography>

          {/* Separator character with secondary color */}
          <Typography variant="h7" sx={{ color: theme.palette.text.secondary }}>
            /
          </Typography>

          {/* Total hours with descriptive text - secondary color for less emphasis */}
          <Typography variant="h7" sx={{ color: theme.palette.text.secondary }}>
            {displayTotalHours} hours projected
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
};
