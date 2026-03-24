import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiMultiSectionDigitalClock
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      root: {
        '& li:hover': {
          backgroundColor: mode === 'dark' ? pmxPalette.dark.primary?.d20 : pmxPalette.light.primary?.l60,
        },
      },
    },
  };
};
