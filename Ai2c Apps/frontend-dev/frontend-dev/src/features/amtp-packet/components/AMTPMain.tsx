import { Box, Typography } from '@mui/material';

import { TabsLayout } from '@components/layout/TabsLayout';

import SoldierInformation from './soldier-info/SoldierInformation';

import { amtpPacketRoutes } from '../routes';
import DownloadPacketDialog from './DownloadPacketDialog';

const AMTPMain = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        overflow: 'auto',
      }}
    >
      <Box display="flex">
        <Typography variant="h4">AMTP Packet</Typography>
        <DownloadPacketDialog />
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <SoldierInformation />
        <TabsLayout data-testid="mock-tabs-layout" title="" routes={amtpPacketRoutes} />
      </Box>
    </Box>
  );
};

export default AMTPMain;
