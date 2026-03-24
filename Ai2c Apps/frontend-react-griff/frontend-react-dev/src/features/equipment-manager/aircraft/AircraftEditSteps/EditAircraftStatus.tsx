import React, { FunctionComponent } from 'react';

import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import { LaunchStatusEnum } from '@models/LaunchStatusEnum';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

/* Props for the step component. */
interface Props {
  launchStatus: LaunchStatusEnum;
  setLaunchStatus: React.Dispatch<React.SetStateAction<LaunchStatusEnum>>;
  ORStatus: OperationalReadinessStatusEnum;
  setORStatus: React.Dispatch<React.SetStateAction<OperationalReadinessStatusEnum>>;
  autoSync: { [sync: string]: boolean };
  setAutoSync: React.Dispatch<React.SetStateAction<{ [sync: string]: boolean }>>;
}

/**
 * A functional component that acts as a form for the Edit Aircraft Status step in Aircraft Multi Edit form.
 *
 * @component * @returns {JSX.Element} The rendered component.
 */
const EditAircraftStatusStep: FunctionComponent<Props> = (props: Props) => {
  const { launchStatus, setLaunchStatus, ORStatus, setORStatus, autoSync, setAutoSync } = props;

  /* ***************************
    Component UI
    *************************** */
  return (
    <Box display="flex" width="100%">
      <Box flex={1}>
        <Typography sx={{ pt: 1, pb: 3 }}>Select a launch status to assign aircraft.</Typography>
        <Stack direction="row" spacing={3}>
          <ToggleButtonGroup
            value={launchStatus}
            exclusive
            onChange={(_, value) => value && setLaunchStatus(value)}
            sx={{ width: '100%' }}
            size="small"
          >
            <ToggleButton sx={{ width: '100%' }} value={LaunchStatusEnum.RTL}>
              {LaunchStatusEnum.RTL}
            </ToggleButton>
            <ToggleButton sx={{ width: '100%' }} value={LaunchStatusEnum.NRTL}>
              {LaunchStatusEnum.NRTL}
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <FormControlLabel
          sx={{ pl: 1, pt: 2 }}
          control={
            <Checkbox
              checked={autoSync.rtl}
              onChange={(e) => setAutoSync((prev) => ({ ...prev, rtl: e.target.checked }))}
            />
          }
          label="Auto-sync launch status for all selected aircraft"
        />
      </Box>
      <Divider orientation="horizontal" flexItem sx={{ borderWidth: 1, mx: 3 }} />
      <Box flex={1}>
        <Typography sx={{ pt: 1, pb: 3 }}>Select an operational readiness status to assign aircraft.</Typography>
        <Stack direction="row" spacing={3}>
          <ToggleButtonGroup
            value={ORStatus}
            exclusive
            onChange={(_, value) => value && setORStatus(value)}
            sx={{ width: '100%' }}
            size="small"
          >
            <ToggleButton sx={{ width: '100%' }} value={OperationalReadinessStatusEnum.FMC}>
              {OperationalReadinessStatusEnum.FMC}
            </ToggleButton>
            <ToggleButton sx={{ width: '100%' }} value={OperationalReadinessStatusEnum.PMCS}>
              {OperationalReadinessStatusEnum.PMCS}
            </ToggleButton>
            <ToggleButton sx={{ width: '100%' }} value={OperationalReadinessStatusEnum.PMCM}>
              {OperationalReadinessStatusEnum.PMCM}
            </ToggleButton>
            <ToggleButton sx={{ width: '100%' }} value={OperationalReadinessStatusEnum.NMCS}>
              {OperationalReadinessStatusEnum.NMCS}
            </ToggleButton>
            <ToggleButton sx={{ width: '100%' }} value={OperationalReadinessStatusEnum.NMCM}>
              {OperationalReadinessStatusEnum.NMCM}
            </ToggleButton>
            <ToggleButton sx={{ width: '100%' }} value={OperationalReadinessStatusEnum.DADE}>
              {OperationalReadinessStatusEnum.DADE}
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <FormControlLabel
          sx={{ pl: 1, pt: 2 }}
          control={
            <Checkbox
              checked={autoSync.status}
              onChange={(e) => setAutoSync((prev) => ({ ...prev, status: e.target.checked }))}
            />
          }
          label="Auto-sync operational readiness status for all selected aircraft"
        />
      </Box>
    </Box>
  );
};

export default EditAircraftStatusStep;
