import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiInputBase
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      root: {
        '& .MuiSlider-rail': {
          backgroundColor: `${pmxPalette[mode].layout.background16} !important`,
        },
        '& .MuiSlider-mark': {
          backgroundColor: `${pmxPalette[mode].grey?.main} !important`,
        },
      },
    },
  };
};
