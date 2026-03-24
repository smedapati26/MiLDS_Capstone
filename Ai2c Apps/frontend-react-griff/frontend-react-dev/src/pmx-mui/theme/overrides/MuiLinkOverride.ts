import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiLink
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return mode === 'dark'
    ? {
        // Dark Mode
        styleOverrides: {
          root: {
            color: pmxPalette.dark.primary?.main,
            textDecorationColor: pmxPalette.dark.primary?.main,
            '&:hover': {
              color: pmxPalette.dark.primary?.l20,
            },
            '&:visited': {
              color: pmxPalette.dark.primary?.l40,
              textDecorationColor: pmxPalette.dark.primary?.l40,
            },
            '&.Mui-disabled': {
              color: `${pmxPalette.dark.primary?.l40}99`, // 60% alpha
              textDecorationColor: `${pmxPalette.dark.primary?.l40}99`, // 60% alpha
            },
          },
        },
      }
    : {
        // Light Mode
        styleOverrides: {
          root: {
            color: pmxPalette.dark.primary?.main,
            textDecorationColor: pmxPalette.dark.primary?.main,
            '&:hover': {
              color: pmxPalette.dark.primary?.d20,
            },
            '&:visited': {
              color: pmxPalette.dark.primary?.d40,
              textDecorationColor: pmxPalette.dark.primary?.d40,
            },
            '&.Mui-disabled': {
              color: `${pmxPalette.dark.primary?.main}99`, // 60% alpha
              textDecorationColor: `${pmxPalette.dark.primary?.main}99`, // 60% alpha
            },
          },
        },
      };
};
