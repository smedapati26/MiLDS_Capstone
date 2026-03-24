import React from 'react';
import dayjs from 'dayjs';

import { Stack, Typography } from '@mui/material';

import { IMaintenanceEventDetails } from '@store/griffin_api/aircraft/models';

interface IMaintenanceTitle {
  title?: string;
  tillDue?: number;
  maintenance?: IMaintenanceEventDetails | null;
}

export const MaintenanceTitle: React.FC<IMaintenanceTitle> = ({
  title,
  tillDue,
  maintenance,
}: IMaintenanceTitle): React.ReactNode => {
  return (
    <Stack direction="column" spacing={2}>
      <Typography variant="h6">{title}</Typography>
      <Stack direction="row" spacing={2}>
        <Typography variant="body3" color="GrayText">
          Hours to Event:
        </Typography>
        <Typography variant="body3">{`${tillDue} hours`}</Typography>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Typography variant="body3" color="GrayText">
          Date:
        </Typography>
        <Typography variant="body3">
          {maintenance
            ? `${dayjs(maintenance.eventStart).format('MM/DD/YYYY')} - ${dayjs(maintenance.eventEnd).format('MM/DD/YYYY')}`
            : `Not yet scheduled`}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Typography variant="body3" color="GrayText">
          Lane
        </Typography>
        <Typography variant="body3">{maintenance ? maintenance.lane : `-`}</Typography>
      </Stack>
    </Stack>
  );
};
