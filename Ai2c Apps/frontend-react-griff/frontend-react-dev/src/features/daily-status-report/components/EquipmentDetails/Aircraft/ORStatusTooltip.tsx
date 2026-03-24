import * as React from 'react';
import dayjs from 'dayjs';

import { Box, styled, Tooltip, TooltipProps, Typography } from '@mui/material';

/**
 * Props for the ORStatusTooltip component
 */
export type ORStatusTooltipProps = {
  status: string;
  ecd?: string | null;
  dateDown?: string | null;
  children: React.ReactElement;
};

/**
 * Styled tooltip with custom styling
 */
const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[700],
    color: theme.palette.common.white,
    boxShadow: theme.shadows[4],
    fontSize: 12,
    padding: theme.spacing(1.5),
    maxWidth: 300,
  },
  '& .MuiTooltip-arrow': {
    color: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[700],
  },
}));

/**
 * Format date string to readable format
 * Handles both ISO datetime strings and date-only strings (YYYY-MM-DD)
 */
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'None';

  try {
    const date = dayjs(dateString);

    if (!date.isValid()) {
      return 'Invalid Date';
    }

    // Check if the date string includes time information
    const hasTime = dateString.includes('T') || dateString.includes(':');

    // Format with or without time based on the input
    return hasTime ? date.format('MMM DD, YYYY HH:mm') : date.format('MMM DD, YYYY');
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Statuses that should show tooltip (non-FMC statuses)
 */
const STATUSES_WITH_TOOLTIP = ['NMC', 'NMCM', 'NMCS', 'PMCM', 'PMCS', 'DADE'];

/**
 * ORStatusTooltip component
 * Displays a tooltip with ECD and Date Down information when hovering over non-FMC statuses
 */
export const ORStatusTooltip: React.FC<ORStatusTooltipProps> = ({ status, ecd, dateDown, children }) => {
  // Only show tooltip for non-FMC statuses
  if (!STATUSES_WITH_TOOLTIP.includes(status)) {
    return children;
  }

  // Build tooltip content - always show, even if dates are null
  const tooltipContent = (
    <Box>
      <Typography variant="body2" fontWeight="bold" mb={1}>
        Status Details
      </Typography>

      <Box display="flex" flexDirection="column" gap={0.5}>
        <Box>
          <Typography variant="caption" component="span" fontWeight="bold">
            Date Down:{' '}
          </Typography>
          <Typography variant="caption" component="span">
            {formatDate(dateDown)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" component="span" fontWeight="bold">
            Est. Completion:{' '}
          </Typography>
          <Typography variant="caption" component="span">
            {formatDate(ecd)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <StyledTooltip title={tooltipContent} arrow placement="top" enterDelay={300} leaveDelay={200}>
      {children}
    </StyledTooltip>
  );
};

export default ORStatusTooltip;
