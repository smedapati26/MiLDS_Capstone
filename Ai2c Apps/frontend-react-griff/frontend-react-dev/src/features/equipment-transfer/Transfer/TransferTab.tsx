import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { Box, Tab, Tabs, Typography, useTheme } from '@mui/material';

const TransferTab: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Extract the last part of the pathname to determine the current tab
  const pathSegments = location.pathname.split('/');
  const lastSegment = pathSegments[pathSegments.length - 1];

  // Map the last segment of the path to the tab value
  const validTabs = ['aircraft', 'uas', 'agse'];
  const currentTab = validTabs.includes(lastSegment) ? lastSegment : 'aircraft';

  return (
    <Box>
      <Typography sx={{ mb: 2 }}>
        Select what type of equipment you would like to transfer. You can only transfer from one unit at a time.
      </Typography>
      <Box style={{ display: 'flex', height: '100%' }}>
        {/* Vertical Tabs */}
        <Tabs
          orientation="vertical"
          value={currentTab}
          aria-label="Transfer Options"
          sx={{
            alignItems: 'flex-start',
            '& .MuiTab-root': {
              color: `${theme.palette.text.secondary}99`,
              textTransform: 'none',
              padding: '2px 16px 2px 1px',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: isDarkMode ? `${theme.palette.primary?.d20}66` : `${theme.palette.primary?.l20}66`,
              },
            },
            '& .Mui-selected': {
              fontWeight: 500,
              color: `${theme.palette.text.primary} !important`,
              backgroundColor: isDarkMode ? `${theme.palette.primary?.d40}66` : `${theme.palette.primary?.l40}66`,
            },
            '& .MuiTabs-indicator': {
              width: '4px',
              left: 0,
              backgroundColor: theme.palette.primary.main,
            },
          }}
        >
          <Tab
            label="Aircraft"
            value="aircraft"
            component={NavLink}
            to="aircraft"
            sx={{ alignItems: 'start', ml: 1 }}
          />
          <Tab
            label="UAS"
            value="uas"
            component={NavLink}
            to="uas"
            sx={{ alignItems: 'start', ml: 1 }}
            disabled={true}
          />
          <Tab
            label="AGSE"
            value="agse"
            component={NavLink}
            to="agse"
            sx={{ alignItems: 'start', ml: 1 }}
            disabled={true}
          />
        </Tabs>
        {/* Content Area */}
        <Box sx={{ ml: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default TransferTab;
