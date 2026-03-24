import React from 'react';

import { Stack, Typography } from '@mui/material';

const ReadyToLaunch: React.FC<{ title: string; value: string }> = ({
  title,
  value,
}: {
  title: string;
  value: string;
}): JSX.Element => {
  return (
    <Stack data-testid={`ready-to-launch-${title}`} direction="column" spacing={1}>
      <Typography variant="body3">{title}</Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
};

export default ReadyToLaunch;
