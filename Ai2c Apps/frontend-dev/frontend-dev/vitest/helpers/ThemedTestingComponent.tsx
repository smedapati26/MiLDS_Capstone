import React from 'react';

import { ThemeProvider } from '@mui/material';

import { PmxThemeContextProvider, usePmxMuiTheme } from '@ai2c/pmx-mui';

import { amapPalette } from '@theme/theme';

export interface Props {
  children: React.ReactNode;
  mode?: 'light' | 'dark';
}

/* Test Component */
export const ThemedTestingComponent: React.FC<Props> = ({ children, mode = 'dark' }) => {
  const [theme, colorMode] = usePmxMuiTheme(amapPalette, mode);

  return (
    <PmxThemeContextProvider theme={theme} colorMode={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </PmxThemeContextProvider>
  );
};
