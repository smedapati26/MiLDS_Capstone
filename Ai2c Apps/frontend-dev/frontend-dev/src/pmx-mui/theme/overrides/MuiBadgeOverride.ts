import { PmxPalette } from '../../models/PmxPalette';

// Update the Typography's variant prop options
declare module '@mui/material/Badge' {
  interface BadgePropsColorOverrides {
    custom: true;
  }
}

/**
 * MUI Style Overrides for MuiBadge
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      root: ({ ownerState }: any) => {
        const common = {
          fontSize: '12px',
          fontWeight: 500,
        };

        switch (ownerState.color) {
          case 'error':
            return {
              ...common,
              '& .MuiBadge-badge': {
                backgroundColor: pmxPalette[mode].error?.main,
                color: pmxPalette[mode].text?.contrastText,
              },
            };

          case 'custom':
            return {
              ...common,
              '& .MuiBadge-badge': {
                backgroundColor: pmxPalette[mode].badge,
                color: pmxPalette[mode].text?.contrastText,
              },
            };

          default:
            return {
              ...common,
              '& .MuiBadge-badge': {
                color: pmxPalette[mode].text?.contrastText,
              },
            };
        }
      },
    },
  };
};
