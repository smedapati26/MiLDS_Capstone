import React, { useState } from 'react';

import { Refresh, SupportAgent } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';

import { Links } from '../utils/links';

interface PmxErrorDisplayProps {
  title?: string;
  message?: string;
  onRefresh?: () => void;
  showSupport?: boolean;
  showRefresh?: boolean;
  trackRetries?: boolean;
}

export const PmxErrorDisplay: React.FC<PmxErrorDisplayProps> = ({
  message = 'Issues loading data. Try refreshing, or contact support if the issue persists.',
  title,
  onRefresh,
  showSupport = true,
  showRefresh = true,
  trackRetries = false,
}) => {
  const [retryCount, setRetryCount] = useState(0);

  const handleRefresh = () => {
    if (trackRetries) {
      setRetryCount((prev) => prev + 1);
    }
    onRefresh?.();
  };
  return (
    <>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <Box>
        <Typography variant="body1" gutterBottom>
          {message}
        </Typography>
        <Typography variant="body1">Try refreshing, or contact support if the issue persists.</Typography>
      </Box>
      <Stack direction="row" spacing={4} mt={4}>
        {showSupport && (
          <Button
            component="a"
            href={Links.SUPPORT}
            rel="noopener noreferrer"
            target="_blank"
            variant="outlined"
            startIcon={<SupportAgent />}
          >
            <Typography variant="body1" mb={'-3px'}>
              Contact
            </Typography>
          </Button>
        )}
        {showRefresh && onRefresh && (
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={() => {
              handleRefresh();
              onRefresh();
            }}
          >
            <Typography variant="body1" mb={'-3px'}>
              Refresh
            </Typography>
          </Button>
        )}
      </Stack>
      <Stack paddingTop={4}>
        {trackRetries && retryCount > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Attempts: {retryCount}
          </Typography>
        )}
      </Stack>
    </>
  );
};

export default PmxErrorDisplay;
