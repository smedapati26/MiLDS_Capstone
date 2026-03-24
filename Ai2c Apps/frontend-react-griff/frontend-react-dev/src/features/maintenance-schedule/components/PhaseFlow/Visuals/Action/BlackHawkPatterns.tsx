import React from 'react';

import { alpha, Box, Divider, Stack, Typography, useTheme } from '@mui/material';

export const BlackHawkPatternsLegend: React.FC = (): JSX.Element => {
  const theme = useTheme();

  return (
    <Stack direction="row" sx={{ mt: 3, mb: 3 }} spacing={3} data-testid="black-hawk-phase-pattern-legend">
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
        <Typography variant="body1">PMI-1</Typography>
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
        <Typography variant="body1">PMI-2</Typography>
      </Stack>
    </Stack>
  );
};

const BlackHawkPatterns: React.FC = (): JSX.Element => {
  return (
    <Stack data-testid="black-hawk-action-patterns" direction="column">
      <Divider sx={{ width: '100%', mt: 3, mb: 3 }} />
      <BlackHawkPatternsLegend />
    </Stack>
  );
};

export default BlackHawkPatterns;
