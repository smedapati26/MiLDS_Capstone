import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

/**
 * @typedef StylizedTitleProps
 * @prop
 */
export interface StylizedTitleProps {
  title: string;
}

/**
 * StylizedTitle Functional Component
 *
 * @param { StylizedTitleProps } props
 */
export const StylizedTitle: React.FC<StylizedTitleProps> = ({ title }) => {
  const theme = useTheme();
  return (
    <Box data-testid="main-layout-stylized-title" display="flex">
      <Typography variant="h5" sx={{ verticalAlign: 'bottom' }}>
        {title.substring(0, 1).toUpperCase()}
      </Typography>
      <Typography variant="h5" sx={{ fontSize: 20, verticalAlign: 'bottom', marginTop: '1px' }}>
        {title.substring(1, title.length - 2).toUpperCase()}
      </Typography>
      <Typography
        variant="h5"
        sx={{
          // If Title ends in '.AI or .AI' then set font size larger
          fontSize: title.slice(-3).toUpperCase() !== '.AI' ? 20 : theme.typography.h5.fontSize,
          verticalAlign: 'bottom',
        }}
      >
        {title.slice(-2).toUpperCase()}
      </Typography>
    </Box>
  );
};
