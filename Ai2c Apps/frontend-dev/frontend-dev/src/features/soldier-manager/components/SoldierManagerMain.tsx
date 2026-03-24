import { useEffect, useState } from 'react';

import { Box, Typography } from '@mui/material';

import { TabsLayout } from '@components/layout/TabsLayout';

import { useGetTransferRequestsQuery } from '../../../store/amap_ai/transfer_request/slices/transferRequestsApi';
import { useGetPermissionRequestsQuery } from '../../../store/amap_ai/user_request/slices/userRequestApiSlice';
import { soldierManagerRoutes } from '../routes';

const SoldierManagerMain = () => {
  const { data: transferData } = useGetTransferRequestsQuery();
  const { data: permissionData } = useGetPermissionRequestsQuery();
  const [totalRequestCount, setTotalRequestCount] = useState<number>(0);

  useEffect(() => {
    let totalCount = 0;

    if (transferData) {
      totalCount += transferData.receivedRequests.length;
    }

    if (permissionData) {
      totalCount += permissionData.length;
    }

    setTotalRequestCount(totalCount);
  }, [transferData, permissionData]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        overflow: 'auto',
      }}
    >
      <Box display="flex" sx={{ pb: 2 }}>
        <Typography variant="h4">Soldier Manager</Typography>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <TabsLayout data-testid="mock-soldier-tabs-layout" title="" routes={soldierManagerRoutes(totalRequestCount)} />
      </Box>
    </Box>
  );
};

export default SoldierManagerMain;
