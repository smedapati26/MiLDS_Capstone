import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiSwitch
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      root: {
        '& .MuiSwitch-switchBase': {
          ':hover': {
            backgroundColor:
              mode === 'dark' ? `${pmxPalette.dark.primary?.d20}66` : `${pmxPalette.dark.primary?.l60}66`, // 40% alpha
          },
          '&.Mui-checked': {
            ':hover': {
              backgroundColor:
                mode === 'dark' ? `${pmxPalette.dark.primary?.d20}66` : `${pmxPalette.light.primary?.l60}66`,
            },
            '&+.MuiSwitch-track': {
              opacity: 1,
              backgroundColor: mode === 'dark' ? pmxPalette.dark.primary?.l60 : pmxPalette.light.primary?.l60,
            },
          },
        },
      },
    },
  };
};
