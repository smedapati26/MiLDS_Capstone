import React from 'react';

import { Box } from '@mui/material';

const MaintenanceTime: React.FC<{ data?: string }> = ({ data }) => {
  return <Box data-testid="MaintenanceTime">Placeholder for the component {data ?? 'no data'}</Box>;
};

export default MaintenanceTime;
