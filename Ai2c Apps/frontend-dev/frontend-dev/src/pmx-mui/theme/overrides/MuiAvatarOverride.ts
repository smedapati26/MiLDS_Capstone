import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiAvatar
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      root: {
        fontSize: 18,
        fontWeight: 500,
        color: pmxPalette[mode].text?.contrastText,
        backgroundColor: pmxPalette[mode].avatar,
      },
    },
  };
};
