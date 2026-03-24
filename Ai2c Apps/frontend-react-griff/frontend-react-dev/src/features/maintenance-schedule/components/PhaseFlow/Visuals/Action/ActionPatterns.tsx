import React from 'react';

import { Stack } from '@mui/material';

import { usePhaseFlowContext } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';
import BlackHawkPatterns from '@features/maintenance-schedule/components/PhaseFlow/Visuals/Action/BlackHawkPatterns';
import ChinookPatterns from '@features/maintenance-schedule/components/PhaseFlow/Visuals/Action/ChinookPhasePatten';

const Patterns = ({ family }: { family: string }) => {
  switch (family) {
    case 'BLACK HAWK':
      return <BlackHawkPatterns />;
    case 'CHINOOK':
      return <ChinookPatterns />;
  }
};

const ActionPatterns: React.FC = (): JSX.Element => {
  const { selectedFamily } = usePhaseFlowContext();

  return (
    <Stack sx={{ mt: 3 }}>
      <Patterns family={selectedFamily[0]} />
    </Stack>
  );
};

export default ActionPatterns;
