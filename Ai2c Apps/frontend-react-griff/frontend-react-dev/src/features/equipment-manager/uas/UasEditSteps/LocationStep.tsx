import React, { useEffect } from 'react';

import { Stack, Typography } from '@mui/material';

import LocationDropdown from '@components/dropdowns/LocationDropdown';
import SyncCheckbox from '@features/equipment-manager/uas/components/SyncCheckbox';

import { IAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';

import { useUasMultiStepData } from './MultiStepContext';

export const LocationStep: React.FC = (): React.ReactNode => {
  const { location, setLocation, fieldSyncStatus, setFieldSyncStatus } = useUasMultiStepData();

  useEffect(() => {
    // automatically set location to null if this component is active and chosen
    setLocation(null);
  }, [setLocation]);

  const handleLocation = (value: IAutoDsrLocation | null): void => {
    setLocation(value as IAutoDsrLocation);
  };

  return (
    <Stack direction="column" spacing={3}>
      <Typography variant="body2">Edit UAVs airframe hours.</Typography>
      <LocationDropdown onChange={handleLocation} defaultValue={location as IAutoDsrLocation} sx={{ width: '100%' }} />
      <SyncCheckbox
        field="location"
        label="Auto-sync data"
        fieldSyncStatus={fieldSyncStatus}
        setFieldSyncStatus={setFieldSyncStatus}
      />
    </Stack>
  );
};
