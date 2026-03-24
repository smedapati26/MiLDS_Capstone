import * as React from 'react';

import Box from '@mui/material/Box';
import { styled, SxProps, Theme } from '@mui/material/styles';

/**
 * Represents a styled toolbar panel.
 *
 * @component
 */
const StyledVerticalToolbarPanel = styled(Box)(({ theme }) => {
  const isDarkMode = theme.palette.mode === 'dark';

  return {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: isDarkMode ? theme.palette.layout?.background5 : theme.palette.layout?.base,
    border: `1px solid ${isDarkMode ? theme.palette.layout?.background7 : theme.palette.layout?.background5}`,
    boxShadow: theme.palette.boxShadow,
    borderRadius: '3px',
    padding: theme.spacing(3),
    paddingTop: theme.spacing(4),
    width: '300px',
    height: '100%',
  };
});

/**
 * Props for the VerticalToolbarPanel component.
 */
type Props = {
  index: number;
  value: number | boolean;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
};

/**
 * VerticalToolbarPanel component.
 *
 * @component
 * @param {Props} props - The props for the VerticalToolbarPanel component.
 * @returns {JSX.Element} The rendered VerticalToolbarPanel component.
 */
export const VerticalToolbarPanel: React.FC<Props> = (props: Props) => {
  const { children, value, index, sx } = props;

  return (
    value === index && (
      <StyledVerticalToolbarPanel
        component="div"
        data-testid={`toolbar-tab-panel-${index}`}
        role="tabpanel"
        hidden={value !== index}
        id={`toolbar-tabpanel-${index}`}
        aria-label={`toolbar-tab-${index}`}
        sx={{ ...sx }}
      >
        {children}
      </StyledVerticalToolbarPanel>
    )
  );
};
