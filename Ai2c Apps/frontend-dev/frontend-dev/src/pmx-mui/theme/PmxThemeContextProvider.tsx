import React, { createContext, useMemo, useState } from 'react';

import { CssBaseline, PaletteMode, ThemeProvider } from '@mui/material';
import { createTheme, Theme } from '@mui/material/styles';

import { PmxPalette } from '../models';
import { baseDarkPalette } from './darkPalette';
import { baseLightPalette } from './lightPalette';
import { getDesignTokens } from './theme';

/**
 * Color Mode Context
 *
 * Allows context to use toggleColorMode function throughout the app
 */
// eslint-disable-next-line react-refresh/only-export-components
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

/**
 * Use PMX MUI Theme Hook
 *
 * Custom hook function that returns the theme and colorMode function to change the theme
 *
 * @param {PmxPalette} [pmxPalette] Light and Dark mode palette - Default is Griffin Palette
 * @param {PaletteMode} [defaultMode] Sets default palette to light or dark mode
 *
 * @returns
 *  - theme: Theme - Light or Dark Theme from theme settings
 *  - colorMode: function - Toggle theme function
 */
// eslint-disable-next-line react-refresh/only-export-components
export const usePmxMuiTheme = (
  pmxPalette: PmxPalette = { light: baseLightPalette, dark: baseDarkPalette },
  defaultMode: PaletteMode = 'dark',
): [Theme, PmxThemeContextProviderProps['colorMode']] => {
  const [mode, setMode] = useState(defaultMode);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const theme = useMemo(() => createTheme(getDesignTokens(mode, pmxPalette)), [mode]);

  return [theme, colorMode];
};

/** PMx Theme Context */
// eslint-disable-next-line react-refresh/only-export-components
export const PmxThemeContext = createContext<Theme | null>(null);

/**
 * @typedef PmxThemeContextProviderProps
 * @prop { Theme } theme - MUI Theme
 * @prop { function } colorMode - function to toggle light and dark mode
 * @prop { React.ReactNode } children - Renderable React elements
 * @prop { PaletteMode } [defaultMode] - Light or Dark mode by default
 */
export type PmxThemeContextProviderProps = {
  theme: Theme;
  colorMode: { toggleColorMode: () => void };
  children: React.ReactNode;
  defaultMode?: PaletteMode;
};

/**
 * PmxThemeContextProvider
 *
 * Wraps all Override components to apply theming
 *
 * @param { PmxThemeContextProviderProps } props
 */
export const PmxThemeContextProvider: React.FC<PmxThemeContextProviderProps> = (props) => {
  const { theme, colorMode, children } = props;

  return (
    <PmxThemeContext.Provider value={theme}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </PmxThemeContext.Provider>
  );
};
