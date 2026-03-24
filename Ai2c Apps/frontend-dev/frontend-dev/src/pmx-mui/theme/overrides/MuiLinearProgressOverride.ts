import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiLinearProgress
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      root: {
        height: '8px',
        borderRadius: '16px',
        backgroundColor: pmxPalette[mode].layout.background12,
      },
    },
  };
};
