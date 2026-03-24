import { ReactNode } from 'react';
import { Dayjs } from 'dayjs';

import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Stack, styled, Typography } from '@mui/material';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';

import { slugify } from '@ai2c/pmx-mui';

import { IOptions } from '@models/IOptions';

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500,
  },
});

/** LastUpdated Props */
export type Props = {
  lastUpdateDate: Dayjs | null;
  tooltipTitle?: ReactNode;
  extraUpdates?: Array<IOptions>;
};

/**
 * LastUpdated Functional Component
 */
export const LastUpdated: React.FC<Props> = ({ lastUpdateDate, tooltipTitle, extraUpdates }) => {
  return (
    <Stack direction="row" gap={2} sx={{ my: 3, alignItems: 'center' }}>
      <RefreshIcon fontSize="small" sx={{ color: 'text.secondary' }} />
      <Typography variant="body3" color="text.secondary">
        Last Updated: {lastUpdateDate ? lastUpdateDate.format('MM/DD/YYYY HH:mm:ss') : null}
      </Typography>
      <StyledTooltip
        title={
          <>
            {tooltipTitle && tooltipTitle}
            {extraUpdates &&
              extraUpdates.map((latest) => (
                <Stack key={slugify(latest.label)} direction="row" justifyContent="space-between" gap={3}>
                  <Typography variant="body3" color="text.secondary">
                    {latest.label}
                  </Typography>
                  <Typography variant="body3">{latest.value}</Typography>
                </Stack>
              ))}
          </>
        }
        placement="right"
      >
        <InfoIcon fontSize="small" />
      </StyledTooltip>
    </Stack>
  );
};
