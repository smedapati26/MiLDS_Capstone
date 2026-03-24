import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiTabs
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: `${pmxPalette[mode].primary?.d20}66`,
        },
        '& .Mui-selected': {
          fontWeight: 500,
          color: `${pmxPalette[mode].primary?.main}`,
        },
      },
    },
  };
};
