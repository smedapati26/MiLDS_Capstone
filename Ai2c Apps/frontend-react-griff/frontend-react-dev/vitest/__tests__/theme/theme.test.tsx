/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import { Theme } from '@mui/material';

import {
  darkPalette,
  extendTheme,
  griffinComponents,
  griffinPalette,
  griffinThemeOptions,
  lightPalette,
} from '../../../src/theme/theme';

describe('theme.tsx', () => {
  it('should export darkPalette with expected structure', () => {
    expect(darkPalette).toBeDefined();
    expect(darkPalette.primary).toBeDefined();
    expect((darkPalette.primary as any)?.main).toBe('#4DA6FF');
  });

  it('should export lightPalette with expected structure', () => {
    expect(lightPalette).toBeDefined();
    expect(lightPalette.primary).toBeDefined();
    expect((lightPalette.primary as any)?.main).toBe('#0073E6');
  });

  it('should export griffinPalette with dark and light palettes', () => {
    expect(griffinPalette).toBeDefined();
    expect(griffinPalette.dark).toBe(darkPalette);
    expect(griffinPalette.light).toBe(lightPalette);
  });

  it('should export griffinComponents with expected Mui components', () => {
    expect(griffinComponents).toBeDefined();
    expect(griffinComponents.MuiTablePagination).toBeDefined();
    expect(griffinComponents.MuiAutocomplete).toBeDefined();
    expect(griffinComponents.MuiDataGrid).toBeDefined();
    expect(griffinComponents.MuiTable).toBeDefined();
  });

  it('should export griffinThemeOptions with palette and components', () => {
    expect(griffinThemeOptions).toBeDefined();
    expect(griffinThemeOptions.palette).toBe(griffinPalette);
    expect(griffinThemeOptions.components).toBe(griffinComponents);
  });

  it('extendTheme should merge components correctly', () => {
    const mockTheme: Theme = {
      palette: {},
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              fontSize: '14px',
            },
          },
        },
      },
    } as Theme;

    const extended = extendTheme(mockTheme);

    expect(extended).toBeDefined();
    expect(extended.components).toHaveProperty('MuiButton');
    expect(extended.components).toHaveProperty('MuiTablePagination');
    expect(extended.components?.MuiButton?.styleOverrides?.root).toEqual({ fontSize: '14px' });
  });
});
