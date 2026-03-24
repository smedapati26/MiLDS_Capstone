import * as React from 'react';

import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * verticalTabPanelA11yProps
 * @param { string }htmlId
 * @param { number } index
 * @returns { React.HTMLProps }
 */
// eslint-disable-next-line react-refresh/only-export-components
export const verticalTabPanelA11yProps = (htmlId: string, index: number) => {
  return {
    id: `${htmlId}-vertical-tab-${index}`,
    'aria-controls': `${htmlId}-vertical-tabpanel-${index}`,
  };
};

/**
 * @typedef VerticalTabPanelProps
 * @prop { number } index - tab index
 * @prop { number } value - Used to hide/show tab panel
 * @prop { React.ReactNode } [children] - Renderable React elements
 */
export type VerticalTabPanelProps = {
  index: number;
  value: number;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
};

/**
 * Vertical Tab Panel
 *
 * Content area for vertical tabs to be displayed into.
 * @see VerticalTabs - MUI Tabs wrapper function used to display Tab Panels
 *
 * @param { const VerticalTabPanel: React.FC<VerticalTabPanelProps> = (props) => {
 } props
 */
export const VerticalTabPanel: React.FC<VerticalTabPanelProps> = (props) => {
  const { children, value, index, sx, ...other } = props;

  return (
    <div
      data-testid={`vertical-tab-panel-${index}`}
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ ...sx }}>{children}</Box>}
    </div>
  );
};
