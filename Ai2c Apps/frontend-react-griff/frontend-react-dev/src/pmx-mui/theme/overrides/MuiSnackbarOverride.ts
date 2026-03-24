import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiSnackbar
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      root: {
        '& .MuiSnackbarContent-root': {
          color: pmxPalette[mode].text?.primary,
          backgroundColor: pmxPalette[mode].layout?.background11,
        },
      },
    },
  };
};
