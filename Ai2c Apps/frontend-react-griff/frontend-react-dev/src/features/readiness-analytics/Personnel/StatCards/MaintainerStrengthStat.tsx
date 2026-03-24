import React from 'react';

import { Box, Skeleton, Typography } from '@mui/material';

/* Props for the MaintainerStrengthStat component. */
interface Props {
  isLoading: boolean;
}

/**
 * A functional component that displays a skeleton loader when data is loading,
 * and a stat card with maintainer strength stats when data is loaded.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.isLoading - A flag indicating whether the data is currently loading.
 * @returns {JSX.Element} The rendered component.
 */
const MaintainerStrengthStat: React.FC<Props> = ({ isLoading }) => {
  if (isLoading)
    return (
      <Skeleton
        data-testid="skeleton"
        variant="rectangular"
        sx={{ minHeight: '200px', minWidth: '400px', width: '100%' }}
      />
    );

  return (
    <Box id="stat-card">
      <Typography variant="h3">Maintainer Strength Stats</Typography>
    </Box>
  );
};

export default MaintainerStrengthStat;
