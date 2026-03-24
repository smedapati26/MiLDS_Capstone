import React from 'react';

import LegendToggleIcon from '@mui/icons-material/LegendToggle';
import { Box, Card, Stack, Typography } from '@mui/material';

const UnitLowerVisual: React.FC = (): JSX.Element => {
  return (
    <Card sx={{ m: 3, border: 'none', boxShadow: 'none', height: '100%' }} data-testid="unit-pf-lower-visual">
      <Box sx={{ m: [5, 4, 5, 4] }}>
        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body2">Unit Phase Flow</Typography>
          <LegendToggleIcon />
        </Stack>
        <Typography variant="body1">You are viewing the Unit Phase Flow in your primary graph screen.</Typography>
      </Box>
    </Card>
  );
};

export default UnitLowerVisual;
