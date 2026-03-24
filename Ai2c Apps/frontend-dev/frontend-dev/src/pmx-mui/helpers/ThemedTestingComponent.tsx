import React from 'react';

import { ThemeProvider } from '@mui/material';
import { PmxPalette, PmxThemeContextProvider, usePmxMuiTheme } from '@pmx-mui-theme/index';

/* Represents ThemedTestingComponent properties */
export interface Props {
  palette: PmxPalette;
  mode: 'light' | 'dark';
  children: React.ReactNode;
}

/**
 * ThemedTestingComponent is a React functional component that provides a themed context for testing purposes.
 *
 * @param {Props} props - The properties object.
 * @param {string} props.palette - The palette to be used for the theme.
 * @param {string} props.mode - The mode to be used for the theme (e.g., light or dark).
 * @param {React.ReactNode} props.children - The child components to be rendered within the theme context.
 *
 * @returns {JSX.Element} A JSX element that wraps the children with the provided theme and color mode.
 */
export const ThemedTestingComponent: React.FC<Props> = ({ palette, mode, children }) => {
  const [theme, colorMode] = usePmxMuiTheme(palette, mode);

  return (
    <PmxThemeContextProvider theme={theme} colorMode={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </PmxThemeContextProvider>
  );
};
