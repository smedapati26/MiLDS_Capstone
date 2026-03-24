import { PmxModePalette } from '@pmx-mui-models/PmxModePalette';

describe('PmxModePalette', () => {
  let palette: PmxModePalette;

  beforeEach(() => {
    palette = {
      primary: {
        l60: '#ffffff',
        l40: '#cccccc',
        l20: '#999999',
        main: '#000000',
        d20: '#333333',
        d40: '#666666',
        d60: '#999999',
        button: {
          hover: {
            fill: '#000000',
            font: '#ffffff',
          },
          pressed: {
            fill: '#333333',
            font: '#cccccc',
          },
          disabled: {
            fill: '#666666',
            font: '#999999',
          },
        },
        outline: {
          fill: 'transparent',
          outline: '#999999',
          font: '#999999',
          hover: {
            fill: '#33333366',
            outline: '#999999',
            font: '#999999',
          },
          pressed: {
            fill: '#66666666',
            outline: '#999999',
            font: '#999999',
          },
          disabled: {
            fill: 'transparent',
            outline: '#99999966',
            font: '#99999966',
          },
        },
      },
      error: { main: '#f44336' },
      warning: { main: '#ff9800' },
      info: { main: '#2196f3' },
      success: { main: '#4caf50' },
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
      army: { main: '#3e2723' },
      graph: {
        purple: '#9c27b0',
        cyan: '#00bcd4',
        teal: '#009688',
        pink: '#e91e63',
        green: '#4caf50',
        blue: '#2196f3',
        magenta: '#ff00ff',
        yellow: '#ffeb3b',
        teal2: '#00796b',
        cyan2: '#00838f',
        orange: '#ff9800',
        purple2: '#7b1fa2',
      },
      stackedBars: {
        first: '#ff5722',
        second: '#ff9800',
        third: '#ffc107',
        forth: '#ffeb3b',
        fifth: '#cddc39',
      },
      avatar: '#3f51b5',
      badge: {
        custom: '#ff4081',
      },
    };
  });

  it('should have optional pressed property in button', () => {
    expect(palette.primary.button.pressed).toBeDefined();
  });

  it('should have optional pressed property in outline', () => {
    expect(palette.primary.outline.pressed).toBeDefined();
  });
});
