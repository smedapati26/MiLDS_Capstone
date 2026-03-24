import React from 'react';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

/**
 * @typedef NumericLinearProgressProps
 * @prop { number } progress - Number used to indicate progress percentage
 */
export type NumericLinearProgressProps = {
  progress: number;
};

/**
 * Numerical Linear Progress Bar
 *
 * Progress bar with percentage text
 *
 * @param { NumericLinearProgressProps } props
 */
export const NumericLinearProgress: React.FC<NumericLinearProgressProps> = ({ progress }) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <LinearProgress sx={{ width: '96%' }} variant="determinate" value={progress} />
      <Typography component="span" variant="body1">
        {Math.round(progress)}%
      </Typography>
    </Box>
  );
};
