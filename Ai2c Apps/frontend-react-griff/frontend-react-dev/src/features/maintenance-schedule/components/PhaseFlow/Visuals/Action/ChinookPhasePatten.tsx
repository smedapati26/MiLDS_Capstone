import React from 'react';

import { alpha, Box, Divider, Stack, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material';

import { usePhaseFlowContext } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';

export const Legend320: React.FC = (): JSX.Element => {
  const theme = useTheme();
  return (
    <Stack direction="row" sx={{ mt: 3, mb: 3 }} spacing={3} data-testid="chinook-320-phase-pattern-legend">
      <Stack direction="row" alignItems="center">
        <Box
          sx={{
            width: 12,
            height: 12,
            bgcolor: theme.palette.primary.main,
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: '50%',
            mr: 2,
            ml: 2,
          }}
        />
        <Typography variant="body1">C1</Typography>
      </Stack>
    </Stack>
  );
};

export const Legend640: React.FC = (): JSX.Element => {
  const theme = useTheme();
  return (
    <Stack direction="row" sx={{ mt: 3, mb: 3 }} spacing={3} data-testid="chinook-640-phase-pattern-legend">
      <Stack direction="row" alignItems="center">
        <Box
          sx={{
            width: 12,
            height: 12,
            bgcolor: theme.palette.primary.main,
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: '50%',
            mr: 2,
            ml: 2,
          }}
        />
        <Typography variant="body1">C2</Typography>
      </Stack>
      <Stack direction="row" alignItems="center">
        <Box
          sx={{
            width: 12,
            height: 12,
            bgcolor: alpha(theme.palette.primary.main, 0.25),
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: '50%',
            mr: 2,
            ml: 2,
          }}
        />
        <Typography variant="body1">C4</Typography>
      </Stack>
    </Stack>
  );
};

const ChinookPatterns: React.FC = (): JSX.Element => {
  const { chinookPhase, setChinookPhase } = usePhaseFlowContext();

  const handleChange = (_event: React.MouseEvent<HTMLElement>, value: string): void => {
    setChinookPhase(value);
  };

  return (
    <Stack data-testid="chinook-action-patterns">
      <ToggleButtonGroup
        value={chinookPhase}
        exclusive
        onChange={handleChange}
        data-testid="chinook-phase-pattern-group"
        fullWidth
      >
        <ToggleButton value="320" data-testid="chinook-320">
          320
        </ToggleButton>
        <ToggleButton value="640" data-testid="chinook-640">
          640
        </ToggleButton>
      </ToggleButtonGroup>
      <Divider sx={{ width: '100%', mt: 3, mb: 3 }} />
      {chinookPhase === '320' ? <Legend320 /> : <Legend640 />}
    </Stack>
  );
};

export default ChinookPatterns;
