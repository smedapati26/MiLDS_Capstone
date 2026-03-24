/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, expect, it } from 'vitest';

import { createTheme } from '@mui/material/styles';

import { amapComponents, amapPalette, darkPalette, extendTheme, lightPalette } from '@theme/theme';
describe('Palette Tests', () => {
  it('should validate amapPalette', () => {
    expect(amapPalette).toHaveProperty('dark', darkPalette);
    expect(amapPalette).toHaveProperty('light', lightPalette);
  });
});

describe('Component Style Overrides', () => {
  const theme = createTheme();

  it('should validate MuiTablePagination overrides', () => {
    const styleOverrides = amapComponents.MuiTablePagination?.styleOverrides;
    const rootStyles =
      typeof styleOverrides?.root === 'function'
        ? // @ts-ignore
          (styleOverrides.root({ theme }) as Record<string, string>)
        : (styleOverrides?.root as Record<string, string>);

    expect(rootStyles).toHaveProperty('position', 'sticky');
    expect(rootStyles).toHaveProperty('bottom', 0);
    expect(rootStyles?.['.MuiTablePagination-toolbar']).toHaveProperty('minHeight', '56px');
    expect(rootStyles?.['.MuiTablePagination-toolbar']).toHaveProperty('padding', theme.spacing(0, 2));
  });

  it('should validate MuiAutocomplete overrides', () => {
    const styleOverrides = amapComponents.MuiAutocomplete?.styleOverrides;
    const rootStyles =
      typeof styleOverrides?.root === 'function'
        ? // @ts-ignore
          (styleOverrides.root({ theme }) as Record<string, string>)
        : (styleOverrides?.root as Record<string, string>);

    expect(rootStyles?.['& .MuiAutocomplete-popper']).toHaveProperty('maxHeight', '400px');
    expect(rootStyles?.['& .MuiAutocomplete-paper']).toHaveProperty(
      'backgroundColor',
      theme.palette.mode === 'dark' ? theme.palette.layout?.background7 : theme.palette.layout?.background5,
    );
  });
});

describe('extendTheme Tests', () => {
  it('should extend the theme with amapComponents', () => {
    const baseTheme = createTheme();
    const extendedTheme = extendTheme(baseTheme);

    expect(extendedTheme.components).toHaveProperty('MuiTablePagination');
    expect(extendedTheme.components).toHaveProperty('MuiAutocomplete');
  });

  it('should preserve existing components in the theme', () => {
    const baseTheme = createTheme({
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
            },
          },
        },
      },
    });

    const extendedTheme = extendTheme(baseTheme);

    expect(extendedTheme.components).toHaveProperty('MuiButton');
    expect(extendedTheme.components?.MuiButton?.styleOverrides).toHaveProperty('root');
    expect(extendedTheme.components?.MuiButton?.styleOverrides?.root).toHaveProperty('textTransform', 'none');
  });
});
