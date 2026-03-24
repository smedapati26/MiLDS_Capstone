import React from 'react';

import { Box, Divider, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

import SyncCheckbox from '@features/equipment-manager/uas/components/SyncCheckbox';

import { UasType } from '@store/griffin_api/uas/models/IUAS';

import { useUasMultiStepData } from './MultiStepContext';

type SelectorType = 'rtl' | 'orStatus';

interface Props {
  uasType: UasType;
}

interface ISelector extends Props {
  editType: SelectorType;
}

/**
 * Ready to launch status toggle
 */
const ReadyToLaunchStatus: React.FC = (): React.ReactNode => {
  const { launchStatus, setLaunchStatus, fieldSyncStatus, setFieldSyncStatus } = useUasMultiStepData();

  return (
    <Stack direction="column" spacing={3} sx={{ width: '100%' }}>
      <ToggleButtonGroup
        value={launchStatus}
        exclusive
        onChange={(_, value) => value && setLaunchStatus(value)}
        size="small"
      >
        <ToggleButton sx={{ width: '100%' }} value="RTL">
          rtl
        </ToggleButton>
        <ToggleButton sx={{ width: '100%' }} value="NRTL">
          nrtl
        </ToggleButton>
      </ToggleButtonGroup>
      <SyncCheckbox
        field="rtl"
        label="Auto-sync data"
        fieldSyncStatus={fieldSyncStatus}
        setFieldSyncStatus={setFieldSyncStatus}
      />
    </Stack>
  );
};

/**
 * Operational Readiness status toggle
 */
const OperationalReadinessStatus: React.FC = (): React.ReactNode => {
  const { ORStatus, setORStatus, setFieldSyncStatus, fieldSyncStatus } = useUasMultiStepData();

  return (
    <Stack direction="column" spacing={3} sx={{ width: '100%' }}>
      <ToggleButtonGroup value={ORStatus} exclusive onChange={(_, value) => value && setORStatus(value)} size="small">
        <ToggleButton sx={{ width: '100%' }} value="FMC">
          FMC
        </ToggleButton>
        <ToggleButton sx={{ width: '100%' }} value="PMC">
          PMC
        </ToggleButton>
        <ToggleButton sx={{ width: '100%' }} value="NMC">
          NMC
        </ToggleButton>
        <ToggleButton sx={{ width: '100%' }} value="DADE">
          DADE
        </ToggleButton>
      </ToggleButtonGroup>
      <SyncCheckbox
        field="status"
        label="Auto-sync data"
        fieldSyncStatus={fieldSyncStatus}
        setFieldSyncStatus={setFieldSyncStatus}
      />
    </Stack>
  );
};

const StatusSelector: React.FC<ISelector> = ({ editType, uasType }: ISelector): React.ReactNode => {
  return (
    <Stack direction="column" spacing={3}>
      <Typography variant="body2">
        {editType === 'rtl' ? 'Edit Launch Status' : 'Edit Operational Readiness Status'}
      </Typography>
      <Typography variant="body1">
        {editType === 'rtl'
          ? 'Select a launch status to assign the select UAVs'
          : `Select an operational readiness status to assign the selected ${uasType === 'Uav' ? 'UAVs' : 'components'}`}
      </Typography>
      {editType === 'rtl' ? <ReadyToLaunchStatus /> : <OperationalReadinessStatus />}
    </Stack>
  );
};

/**
 * Operational and ready to launch status edit component
 * @param props
 */
export const StatusStep: React.FC<Props> = ({ uasType }: Props): React.ReactNode => {
  return (
    <Box>
      {uasType === 'Uav' ? (
        <Stack direction="row" spacing={3} sx={{ width: '100%' }}>
          <Stack sx={{ flex: 1 }}>
            <StatusSelector editType="rtl" uasType={uasType} />
          </Stack>
          <Divider orientation="vertical" flexItem sx={{ width: '1px' }} />
          <Stack sx={{ flex: 1 }}>
            <StatusSelector editType="orStatus" uasType={uasType} />
          </Stack>
        </Stack>
      ) : (
        <Box sx={{ width: '50%' }}>
          <StatusSelector editType="orStatus" uasType={uasType} />
        </Box>
      )}
    </Box>
  );
};
