import React from 'react';

import { Stack } from '@mui/material';

import AircraftEquipmentDetailsSection from '@features/equipment-manager/aircraft/AircraftEquipmentSection';
import AircraftOverviewCarousel from '@features/equipment-manager/aircraft/AircraftOverviewCarousel';

const AircraftTab: React.FC = (): JSX.Element => {
  return (
    <Stack data-testid="em-aircraft-tab" spacing={3}>
      <AircraftOverviewCarousel />
      <AircraftEquipmentDetailsSection />
    </Stack>
  );
};

export default AircraftTab;
