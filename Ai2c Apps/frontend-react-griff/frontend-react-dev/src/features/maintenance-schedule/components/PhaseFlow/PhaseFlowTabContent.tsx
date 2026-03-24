import React from 'react';

import { Box, Container, Grid, Stack } from '@mui/material';

import PhaseFlowBankTime from '@features/maintenance-schedule/components/PhaseFlow/BankTime/PhaseFlowBankTime';
import PhaseFlowSelector from '@features/maintenance-schedule/components/PhaseFlow/Component/PhaseFlowSelector';
import PhaseFlowInsights from '@features/maintenance-schedule/components/PhaseFlow/Insights/PhaseFlowInsights';
import PhaseFlowVisuals from '@features/maintenance-schedule/components/PhaseFlow/Visuals/PhaseFlowVisuals';

const PhaseFlowTabContent: React.FC = (): React.ReactElement => {
  return (
    <Box data-testid="ms-phase-flow-tab-container">
      <PhaseFlowSelector />

      <Container
        maxWidth={false}
        disableGutters
        sx={{
          border: 'none',
          boxShadow: 'none',
          backgroundColor: 'transparent',
          mt: 4,
          alignItems: 'stretch',
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={3}>
            <Stack spacing={3} sx={{ height: '100%' }}>
              <PhaseFlowBankTime />
              <PhaseFlowInsights />
            </Stack>
          </Grid>
          <Grid item xs={9}>
            <Box sx={{ height: '100%' }}>
              <PhaseFlowVisuals />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PhaseFlowTabContent;
