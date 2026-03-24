import { SimplePaletteColorOptions } from '@mui/material/styles';

export type PmxModePalette = {
  primary: {
    l60: string;
    l40: string;
    l20: string;
    main: string;
    d20: string;
    d40: string;
    d60: string;
    button: {
      hover: {
        fill: string;
        font: string;
      };
      pressed?: {
        fill: string;
        font: string;
      };
      disabled: {
        fill: string;
        font: string;
      };
    };
    outline: {
      fill: string; // transparent
      outline: string; // l20
      font: string; // l20
      hover: {
        fill: string; // d20 @40%
        outline: string; // l20
        font: string; // l20
      };
      pressed?: {
        fill: string; // d40 @40%
        outline: string; // l20
        font: string; // l20
      };
      disabled: {
        fill: string; // transparent
        outline: string; // l20 @40%
        font: string; // l20 @40%
      };
    };
  };
  error: SimplePaletteColorOptions;
  warning: SimplePaletteColorOptions;
  info: SimplePaletteColorOptions;
  success: SimplePaletteColorOptions;
  layout: {
    base: string;
    background5: string;
    background7: string;
    background8: string;
    background9: string;
    background11: string;
    background12: string;
    background14: string;
    background15: string;
    background16: string;
  };
  army: SimplePaletteColorOptions;
  graph: {
    purple: string;
    cyan: string;
    teal: string;
    pink: string;
    green: string;
    blue: string;
    magenta: string;
    yellow: string;
    teal2: string;
    cyan2: string;
    orange: string;
    purple2: string;
  };
  stackedBars: {
    first: string;
    second: string;
    third: string;
    forth: string;
    fifth: string;
  };
  avatar: string;
  badge: {
    custom: string;
  };
};
