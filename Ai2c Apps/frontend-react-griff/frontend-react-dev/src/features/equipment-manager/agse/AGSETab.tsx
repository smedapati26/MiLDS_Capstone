import React from 'react';

import { Stack } from '@mui/material';

import AGSECarousel from '@features/equipment-manager/agse/AGSECarousel';
import AGSEEquipmentDetailsSection from '@features/equipment-manager/agse/AGSEEquipmentDetailsSection';

const AGSETab: React.FC = (): JSX.Element => {
  return (
    <Stack direction="column" spacing={3} data-testid="em-agse-tab">
      <AGSECarousel />
      <AGSEEquipmentDetailsSection />
    </Stack>
  );
};

export default AGSETab;
