import React from 'react';

import { Stack, TextField, Typography } from '@mui/material';

import SyncCheckbox from '@features/equipment-manager/uas/components/SyncCheckbox';

import { useUasMultiStepData } from './MultiStepContext';

export const RemarkStep: React.FC = (): React.ReactNode => {
  const { remarks, setRemarks, fieldSyncStatus, setFieldSyncStatus } = useUasMultiStepData();

  return (
    <Stack direction="column" spacing={3}>
      <Typography variant="body2">Edit UAVs airframe hours.</Typography>
      <TextField
        id="uas-multi-edit-hours-remarks"
        data-testid="uas-multi-edit-remarks"
        label="Remarks"
        multiline
        rows={3}
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        sx={{ width: '100%' }}
        size="small"
      />
      <SyncCheckbox
        field="remarks"
        label="Auto-sync data"
        fieldSyncStatus={fieldSyncStatus}
        setFieldSyncStatus={setFieldSyncStatus}
      />
    </Stack>
  );
};
