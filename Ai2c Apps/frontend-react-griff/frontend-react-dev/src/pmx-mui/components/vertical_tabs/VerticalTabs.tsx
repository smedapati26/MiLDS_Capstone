import React from 'react';

import { SxProps, Theme, useTheme } from '@mui/material';
import Tabs from '@mui/material/Tabs';

/**
 * @typedef VerticalTabsProps
 * @prop { number } value - Selected/Active tab
 * @prop { function } handleChange - Callback function passed in as dependency to handle tab changes
 * @prop { React.ReactNode } [children] - Renderable React elements
 */
export type VerticalTabsProps = {
  value: number;

  handleChange: (event: React.SyntheticEvent, newValue: number) => void;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
};

/**
 * Vertical Tabs
 *
 * MUI Tabs wrapper that applies custom styling for vertical tabs.
 * @see VerticalTabsPanel - Panel that can optionally be used for tab panel display.
 *
 * @param { VerticalTabsProps } props
 */
export const VerticalTabs: React.FC<VerticalTabsProps> = (props) => {
  const { children, value, handleChange, sx, ...other } = props;
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Tabs
      orientation="vertical"
      variant="scrollable"
      value={value}
      onChange={handleChange}
      aria-label="Vertical tabs example"
      sx={{
        '& .MuiTab-root': {
          color: `${theme.palette.text.secondary}99`,
          textTransform: 'none',
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
          width: '5px',
          left: 0,
        },
        ...sx,
      }}
      {...other}
    >
      {children}
    </Tabs>
  );
};
