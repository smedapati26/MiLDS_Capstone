import { PaletteOptions } from '@mui/material';
import { PmxPalette } from '@pmx-mui-models/PmxPalette';

describe('PmxPalette', () => {
  const darkPalette: PaletteOptions = {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#ffffff',
    },
    boxShadow: '1px 2px 3px rgba(0, 0, 0, 0.25)',
    layout: {
      base: '#ffffff',
      background5: '#f5f5f5',
      background7: '#eeeeee',
      background8: '#e0e0e0',
      background9: '#bdbdbd',
      background11: '#9e9e9e',
      background12: '#757575',
      background14: '#616161',
      background15: '#424242',
      background16: '#212121',
    },
    avatar: '#3f51b5',
    badge: '#ff4081',
  };

  const lightPalette: PaletteOptions = {
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#000000',
    },
    boxShadow: '1px 2px 3px rgba(0, 0, 0, 0.25)',
    layout: {
      base: '#ffffff',
      background5: '#f5f5f5',
      background7: '#eeeeee',
      background8: '#e0e0e0',
      background9: '#bdbdbd',
      background11: '#9e9e9e',
      background12: '#757575',
      background14: '#616161',
      background15: '#424242',
      background16: '#212121',
    },
    avatar: '#3f51b5',
    badge: '#ff4081',
  };

  const pmxPalette: PmxPalette = {
    dark: darkPalette,
    light: lightPalette,
  };

  it('should have a dark palette with correct primary and secondary colors', () => {
    expect(pmxPalette.dark.primary?.main).toBe('#000000');
    expect(pmxPalette.dark.secondary?.main).toBe('#ffffff');
  });

  it('should have a light palette with correct primary and secondary colors', () => {
    expect(pmxPalette.light.primary?.main).toBe('#ffffff');
    expect(pmxPalette.light.secondary?.main).toBe('#000000');
  });
});
