import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for Elevation
 * @see Paper
 * @see Accordion
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      root: ({ ownerState }: any) => {
        if (ownerState.elevation === 0) return {};

        return {
          border: `1px solid ${mode === 'dark' ? pmxPalette.dark.layout.background12 : pmxPalette.light.layout.background8}`,
          borderRadius: '3px',
          margin: '2px',
          boxShadow: pmxPalette[mode].boxShadow,
          backgroundColor: mode === 'dark' ? pmxPalette.dark.layout.background7 : pmxPalette.light.layout.base,
        };
      },
    },
  };
};
