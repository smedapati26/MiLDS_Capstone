import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiDateCalenderOverride
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      root: {
        '& .MuiPickersDay-root': {
          '&.Mui-selected': {
            backgroundColor: `${pmxPalette[mode].primary?.main} !important`,
          },
          '&:hover': {
            backgroundColor:
              mode === 'dark' ? `${pmxPalette.dark.primary?.d20}66` : `${pmxPalette.light.primary?.l60}66`,
          },
        },
      },
    },
  };
};
