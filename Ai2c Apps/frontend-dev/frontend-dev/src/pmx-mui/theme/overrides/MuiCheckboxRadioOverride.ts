import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiCheckbox & MuiRadio
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      root: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '32px',
        height: '32px',
        '&:hover': {
          backgroundColor: mode === 'dark' ? `${pmxPalette.dark.primary?.d20}66` : `${pmxPalette.light.primary?.l60}66`,
        },
        '&.Mui-disabled': {
          color: `${pmxPalette[mode].text?.primary}66`,
          '&.Mui-checked': {
            color: `${pmxPalette[mode].primary?.main}66`,
          },
        },
      },
    },
  };
};
