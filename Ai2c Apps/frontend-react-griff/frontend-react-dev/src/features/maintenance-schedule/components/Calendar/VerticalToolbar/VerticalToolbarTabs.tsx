import React from 'react';

import { styled, SxProps, Theme } from '@mui/material';
import Tabs from '@mui/material/Tabs';

/**
 * Represents a styled tabs component.
 *
 * @component
 */
const StyledTabs = styled(Tabs)(({ theme }) => {
  const isDarkMode = theme.palette.mode === 'dark';

  return {
    height: '100%',
    width: '50px',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    '& .MuiTab-root': {
      color: `${theme.palette.text.primary}`,
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
      right: 0,
    },
    '& .MuiButtonBase-root': {
      minWidth: '50px',
    },
  };
});

/**
 * Props for the VerticalToolbarTabs component.
 */
type Props = {
  value: number;
  handleChange: (event: React.SyntheticEvent, newValue: number) => void;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
};

/**
 * VerticalToolbarTabs component.
 *
 * This component renders a vertical toolbar with tabs.
 *
 * @component
 * @example
 * ```tsx
 * <VerticalToolbarTabs value={0} handleChange={handleTabChange}>
 *   <Tab label="Tab 1" />
 *   <Tab label="Tab 2" />
 *   <Tab label="Tab 3" />
 * </VerticalToolbarTabs>
 * ```
 *
 * @param {Props} props - The props for the VerticalToolbarTabs component.
 * @param {React.ReactNode} props.children - The content of the VerticalToolbarTabs component.
 * @param {number} props.value - The currently selected tab value.
 * @param {Function} props.handleChange - The function to handle tab change.
 * @param {Object} props.sx - The custom styles for the VerticalToolbarTabs component.
 * @param {...any} props.other - The other props for the VerticalToolbarTabs component.
 * @returns {JSX.Element} The rendered VerticalToolbarTabs component.
 */
export const VerticalToolbarTabs: React.FC<Props> = (props) => {
  const { children, value, handleChange, sx } = props;

  return (
    <StyledTabs
      orientation="vertical"
      value={value}
      onChange={handleChange}
      aria-label="toolbar tabs example"
      sx={{ ...sx }}
    >
      {children}
    </StyledTabs>
  );
};
