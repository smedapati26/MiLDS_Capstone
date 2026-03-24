import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiAlert
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  const common = {
    borderRadius: '3px',
    boxShadow: pmxPalette[mode].boxShadow,
  };

  return mode === 'dark'
    ? {
        styleOverrides: {
          root: { ...common },
          standardSuccess: {
            color: pmxPalette.dark.success?.d60,
            backgroundColor: pmxPalette.dark.success?.l80,
            '& .MuiSvgIcon-root': {
              color: pmxPalette.dark.success?.d60,
            },
          },
          standardInfo: {
            color: pmxPalette.dark.info?.d60,
            backgroundColor: pmxPalette.dark.info?.l80,
            '& .MuiSvgIcon-root': {
              color: pmxPalette.dark.info?.d60,
            },
          },
          standardWarning: {
            color: pmxPalette.dark.warning?.d60,
            backgroundColor: pmxPalette.dark.warning?.l60,
            '& .MuiSvgIcon-root': {
              color: pmxPalette.dark.warning?.d60,
            },
          },
          standardError: {
            color: pmxPalette.dark.error?.d60,
            backgroundColor: pmxPalette.dark.error?.l80,
            '& .MuiSvgIcon-root': {
              color: pmxPalette.dark.error?.d60,
            },
          },
        },
      }
    : {
        styleOverrides: {
          root: { ...common },
          standardSuccess: {
            color: pmxPalette.light.text?.contrastText,
            backgroundColor: pmxPalette.light.success?.d20,
            '& .MuiSvgIcon-root': {
              color: pmxPalette.light.text?.contrastText,
            },
          },
          standardInfo: {
            color: pmxPalette.light.text?.primary,
            backgroundColor: pmxPalette.light.info?.main,
            '& .MuiSvgIcon-root': {
              color: pmxPalette.light.text?.primary,
            },
          },
          standardWarning: {
            color: pmxPalette.light.text?.primary,
            backgroundColor: pmxPalette.light.warning?.main,
            '& .MuiSvgIcon-root': {
              color: pmxPalette.light.text?.primary,
            },
          },
          standardError: {
            color: pmxPalette.light.text?.contrastText,
            backgroundColor: pmxPalette.light.error?.d20,
            '& .MuiSvgIcon-root': {
              color: pmxPalette.light.text?.contrastText,
            },
          },
        },
      };
};
