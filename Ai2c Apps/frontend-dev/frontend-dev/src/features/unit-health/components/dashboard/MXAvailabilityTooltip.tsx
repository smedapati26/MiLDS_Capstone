import React from 'react';

import { Grid, Tooltip, Typography, useTheme } from '@mui/material';

import { IUnitAvailabilityFlagDetails } from '@store/amap_ai/unit_health';

export interface IMXAvailability {
  flagData: IUnitAvailabilityFlagDetails | undefined;
  children: React.ReactElement;
}

export const MXAvailabilityTooltip: React.FunctionComponent<IMXAvailability> = ({ flagData, children }) => {
  const theme = useTheme();

  const tooltipUI = (
    <React.Fragment>
      <Typography sx={{ fontWeight: 500, fontSize: 14, pb: 2 }}>{flagData?.status}</Typography>

      {flagData?.remarks && <Typography variant="body3">{flagData.remarks}</Typography>}

      {flagData && (
        <Grid sx={{ pt: 2 }}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body3" color={theme.palette.text.secondary} sx={{ pr: 2 }}>
              Type:
            </Typography>
            <Typography variant="body3" color={theme.palette.text.primary}>
              {flagData.flagType ?? '--'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body3" color={theme.palette.text.secondary} sx={{ pr: 2 }}>
              Flag Information:
            </Typography>
            <Typography variant="body3" color={theme.palette.text.primary}>
              {flagData.flagInfo ?? '--'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body3" color={theme.palette.text.secondary} sx={{ pr: 2 }}>
              Start Date:
            </Typography>
            <Typography variant="body3" color={theme.palette.text.primary}>
              {flagData.startDate}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body3" color={theme.palette.text.secondary} sx={{ pr: 2 }}>
              End Date:
            </Typography>
            <Typography variant="body3" color={theme.palette.text.primary}>
              {flagData.endDate ?? '--'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body3" color={theme.palette.text.secondary} sx={{ pr: 2 }}>
              Recorder:
            </Typography>
            <Typography variant="body3" color={theme.palette.text.primary}>
              {flagData.recorcedBy ?? '--'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body3" color={theme.palette.text.secondary} sx={{ pr: 2 }}>
              Updated By:
            </Typography>
            <Typography variant="body3" color={theme.palette.text.primary}>
              {flagData.updatedBy ?? '--'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body3" color={theme.palette.text.secondary} sx={{ pr: 2 }}>
              Unit:
            </Typography>
            <Typography variant="body3" color={theme.palette.text.primary}>
              {flagData.unit ?? '--'}
            </Typography>
          </Grid>
        </Grid>
      )}
      {flagData === undefined && (
        <Typography sx={{ fontWeight: 500, fontSize: 14, pb: 2 }}>No additional availability data</Typography>
      )}
    </React.Fragment>
  );

  return (
    <Tooltip title={tooltipUI} PopperProps={{ sx: { zIndex: 1300 } }} placement="bottom-end">
      {children}
    </Tooltip>
  );
};
