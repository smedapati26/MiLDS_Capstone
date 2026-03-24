import React from 'react';

import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';

import { PmxThemeContextProvider, usePmxMuiTheme } from '@ai2c/pmx-mui/theme';

import { griffinPalette } from '@theme/theme';

import { SnackbarProvider } from '@store/providers/SnackbarProvider';

export interface Props {
  children: React.ReactNode;
  mode?: 'light' | 'dark';
}

/* Test Component */
export const ThemedTestingComponent: React.FC<Props> = ({ children, mode = 'dark' }) => {
  const [theme, colorMode] = usePmxMuiTheme(griffinPalette, mode);

  return (
    <PmxThemeContextProvider theme={theme} colorMode={colorMode}>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </SnackbarProvider>
    </PmxThemeContextProvider>
  );
};

/**
 * renderWithTheme
 *
 * @param children {React.ReactNode}
 * @returns { RenderResult } Rendered Component results
 */
export const renderWithTheme = (children: React.ReactElement) => {
  return render(<ThemedTestingComponent>{children}</ThemedTestingComponent>);
};
