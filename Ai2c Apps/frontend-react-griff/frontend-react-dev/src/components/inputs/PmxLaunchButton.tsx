import React from 'react';
import { NavLink } from 'react-router-dom';

import LaunchIcon from '@mui/icons-material/Launch';
import { IconButton, useTheme } from '@mui/material';

import { generateTestId } from '@utils/helpers/generateTestId';

/**
 * PmxLaunchButton
 *
 * @param path {string} Route URL path
 * @returns React.FC
 */
export const PmxLaunchButton: React.FC<{ path: string }> = ({ path }) => {
  const theme = useTheme();

  return (
    <IconButton
      data-testid={generateTestId('launch-nav-link')}
      aria-label="Launch navigation link"
      component={NavLink}
      to={path}
      sx={{ color: theme.palette.text.primary, fontSize: theme.typography.h6, top: theme.spacing(-1) }}
    >
      <LaunchIcon />
    </IconButton>
  );
};

export default PmxLaunchButton;
