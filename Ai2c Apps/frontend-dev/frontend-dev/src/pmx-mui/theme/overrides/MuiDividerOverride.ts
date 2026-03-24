import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiDivider
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      root: {
        borderColor: pmxPalette[mode].layout.background16,
      },
    },
  };
};
