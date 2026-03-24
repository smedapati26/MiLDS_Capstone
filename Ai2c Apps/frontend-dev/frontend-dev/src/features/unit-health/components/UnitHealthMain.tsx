import { Box, Typography } from '@mui/material';

import { TabsLayout } from '@ai2c/pmx-mui';

import { unitHealthRoutes } from '../routes';

const UnitHealthMain = () => {
  return (
    <div id="amtp-packet-container">
      <Box display="flex">
        <Typography variant="h4">Unit Health</Typography>
      </Box>
      <TabsLayout title="" routes={unitHealthRoutes} />
    </div>
  );
};

export default UnitHealthMain;
