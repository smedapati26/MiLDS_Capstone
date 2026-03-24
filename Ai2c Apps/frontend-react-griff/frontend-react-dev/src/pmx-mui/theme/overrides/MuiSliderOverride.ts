import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiSlider
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      root: {
        borderRadius: '3px',
        borderColor: pmxPalette[mode].text?.primary,
        '&:hover': {
          borderColor: pmxPalette[mode].primary?.main,
        },
        '&.Mui-focused': {
          borderColor: pmxPalette[mode].primary?.main,
        },
      },
    },
  };
};
