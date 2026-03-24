import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiTooltip
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  const common = {
    padding: '12px 16px', // theme.spacing(3) = 12px, theme.spacing(4) = 16px
    boxShadow: pmxPalette[mode].boxShadow,
    borderRadius: '3px',
  };

  return {
    styleOverrides: {
      tooltip:
        mode === 'dark'
          ? {
              // Dark mode
              ...common,
              color: pmxPalette.dark.text?.primary,
              backgroundColor: pmxPalette.dark.layout.background12,
            }
          : {
              // Light mode
              ...common,
              color: pmxPalette.light.text?.primary,
              backgroundColor: pmxPalette.light.layout.background7,
            },
    },
  };
};
