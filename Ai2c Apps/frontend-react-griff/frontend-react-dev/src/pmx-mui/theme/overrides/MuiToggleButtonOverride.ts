import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for ToggleButton
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      root: {
        borderRadius: '3px',
        color: pmxPalette[mode].text?.secondary,
        borderColor: pmxPalette[mode].text?.secondary,
        '&:hover': {
          backgroundColor: mode === 'dark' ? `${pmxPalette.dark.primary?.d20}66` : `${pmxPalette.dark.primary?.l40}66`,
        },
        '&:active': {
          backgroundColor: mode === 'dark' ? `${pmxPalette.dark.primary?.d20}99` : `${pmxPalette.dark.primary?.l40}99`, // 60% alpha
        },
        '& .MuiTouchRipple-child': {
          backgroundColor: mode === 'dark' ? `${pmxPalette.dark.primary?.d20}99` : `${pmxPalette.dark.primary?.l40}99`, // 60% alpha
        },
        '&.Mui-selected': {
          color: mode === 'dark' ? pmxPalette.dark.primary?.l20 : pmxPalette.light.primary?.d20,
          borderColor: pmxPalette[mode].primary?.main,
          backgroundColor: mode === 'dark' ? `${pmxPalette.dark.primary?.d40}66` : `${pmxPalette.dark.primary?.l60}66`,
          '&:hover': {
            backgroundColor:
              mode === 'dark' ? `${pmxPalette.dark.primary?.d20}cc` : `${pmxPalette.dark.primary?.l40}cc`,
          },
          '&:active': {
            backgroundColor:
              mode === 'dark' ? `${pmxPalette.dark.primary?.d20}cc` : `${pmxPalette.dark.primary?.l40}cc`, // 80% alpha
          },
          '& .MuiTouchRipple-child': {
            backgroundColor:
              mode === 'dark' ? `${pmxPalette.dark.primary?.d20}cc` : `${pmxPalette.dark.primary?.l40}cc`, // 80% alpha
          },
        },
      },
    },
  };
};
