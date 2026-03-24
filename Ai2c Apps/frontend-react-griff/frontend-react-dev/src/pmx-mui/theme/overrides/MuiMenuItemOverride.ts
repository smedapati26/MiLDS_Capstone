import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiMenuItem
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      root: {
        '& .MuiSvgIcon-root': {
          marginRight: '8px', // theme.spacing(2) = 8px
        },
        '& .MuiCheckbox-root': {
          '& .MuiSvgIcon-root': {
            marginRight: '0px',
          },
        },
        ':hover': {
          backgroundColor: mode === 'dark' ? pmxPalette.dark.primary?.d20 : pmxPalette.light.primary?.l60,
        },
      },
    },
  };
};
