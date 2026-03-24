import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for Drawer
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  const common = {
    '& .MuiDrawer-paper': {
      margin: 0,
      backgroundColor: pmxPalette[mode].layout.background5,
      boxShadow: 'none',
    },
  };

  return {
    styleOverrides: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      root: ({ ownerState }: any) => {
        if (ownerState.variant === 'table') {
          return {
            ...common,
            boxShadow: pmxPalette[mode].boxShadow,
          };
        }

        return { ...common };
      },
    },
  };
};
