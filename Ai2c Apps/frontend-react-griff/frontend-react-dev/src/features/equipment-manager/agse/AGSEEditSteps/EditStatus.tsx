import React, { FunctionComponent } from 'react';

import { Box, Checkbox, FormControlLabel, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

/* Props for the step component. */
interface Props {
  ORStatus: OperationalReadinessStatusEnum;
  setORStatus: React.Dispatch<React.SetStateAction<OperationalReadinessStatusEnum>>;
  autoSync: { [sync: string]: boolean };
  setAutoSync: React.Dispatch<React.SetStateAction<{ [sync: string]: boolean }>>;
}

/**
 * A functional component that acts as a form for the Edit Status step in AGSE Multi Edit form.
 *
 * @component * @returns {JSX.Element} The rendered component.
 */
const EditStatusStep: FunctionComponent<Props> = (props: Props) => {
  const { ORStatus, setORStatus, autoSync, setAutoSync } = props;

  /* ***************************
    Component UI
    *************************** */
  return (
    <Box display="flex" width="100%">
      <Box width="50%">
        <Typography sx={{ pt: 1, pb: 3 }}>Select an operational readiness status to assign AGSE.</Typography>
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
            <ToggleButton sx={{ width: '100%' }} value={OperationalReadinessStatusEnum.PMC}>
              {OperationalReadinessStatusEnum.PMC}
            </ToggleButton>
            <ToggleButton sx={{ width: '100%' }} value={OperationalReadinessStatusEnum.NMC}>
              {OperationalReadinessStatusEnum.NMC}
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

export default EditStatusStep;
