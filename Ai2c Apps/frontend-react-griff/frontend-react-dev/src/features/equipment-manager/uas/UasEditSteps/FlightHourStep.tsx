import React from 'react';

import { Stack, TextField, Typography } from '@mui/material';

import SyncCheckbox from '@features/equipment-manager/uas/components/SyncCheckbox';

import { useUasMultiStepData } from './MultiStepContext';

export const FlightHourStep: React.FC = (): React.ReactNode => {
  const { flightHours, setFlightHours, fieldSyncStatus, setFieldSyncStatus } = useUasMultiStepData();

  return (
    <Stack direction="column" spacing={3}>
      <Typography variant="body2">Edit UAVs airframe hours.</Typography>
      <TextField
        id="uas-multi-edit-hours-flown"
        data-testid="uas-multi-edit-hours-flown"
        label="Period Hours"
        value={flightHours}
        onChange={(e) => setFlightHours(e.target.value)}
        sx={{ width: '40%' }}
        size="small"
      />
      <SyncCheckbox
        field="flightHours"
        label="Auto-sync data"
        fieldSyncStatus={fieldSyncStatus}
        setFieldSyncStatus={setFieldSyncStatus}
      />
    </Stack>
  );
};
