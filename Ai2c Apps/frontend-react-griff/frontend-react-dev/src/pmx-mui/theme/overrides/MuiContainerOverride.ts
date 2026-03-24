import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for Container
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  const common = {
    borderWidth: '1px',
    borderRadius: '3px',
    borderStyle: 'solid',
  };

  return {
    styleOverrides: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      root: ({ ownerState }: any) => {
        if (ownerState.variant === 'secondary') {
          return {
            ...common,
            borderColor:
              mode === 'dark' ? pmxPalette.dark?.layout?.background12 : pmxPalette.light?.layout?.background8,
            backgroundColor:
              mode === 'dark' ? pmxPalette.dark?.layout?.background9 : pmxPalette.light?.layout?.background5,
            boxShadow: 'none',
          };
        }

        return {
          ...common,
          borderColor: mode === 'dark' ? pmxPalette.dark?.layout?.background7 : pmxPalette.light?.layout?.background5,
          backgroundColor: mode === 'dark' ? pmxPalette.dark?.layout?.background5 : pmxPalette.light?.layout?.base,
          boxShadow: pmxPalette[mode].boxShadow,
        };
      },
    },
  };
};
