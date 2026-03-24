import React from 'react';

import { Stack } from '@mui/material';

import UasEquipmentDetailSection from '@features/equipment-manager/uas/UasEquipmentDetailSection';
import UasOverviewCarousel from '@features/equipment-manager/uas/UasOverviewCarousel';

const UasTab: React.FC = (): JSX.Element => {
  return (
    <Stack data-testid="em-uas-tab" direction="column" spacing={3}>
      <UasOverviewCarousel />
      <UasEquipmentDetailSection />
    </Stack>
  );
};

export default UasTab;
