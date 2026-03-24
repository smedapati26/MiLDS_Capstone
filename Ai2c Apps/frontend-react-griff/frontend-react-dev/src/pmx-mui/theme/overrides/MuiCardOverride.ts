import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiCheckbox & MuiRadio
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  const common = {
    border: `1px solid ${pmxPalette[mode].layout.background16}`,
    borderRadius: '3px',
    margin: '2px',
    boxShadow: '1px 2px 2px 0px rgba(0, 0, 0, 0.25)',
    backgroundColor: mode === 'dark' ? pmxPalette.dark.layout.background9 : pmxPalette.light.layout.background5,
    '& .MuiCardHeader-root': {
      '& .MuiCardHeader-content': {
        '& .MuiTypography-root': {
          fontSize: 16,
          fontWeight: 'bold',
        },
        '& .MuiCardHeader-subheader': {
          fontSize: 14,
          fontWeight: 400,
        },
      },
    },
    '& .MuiCardContent-root': {
      '& .MuiTypography-root': {
        fontSize: 16,
        fontWeight: 500,
      },
    },
  };

  return {
    styleOverrides: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      root: ({ ownerState }: any) => {
        if (ownerState.elevation === 0) return {};

        if (ownerState.variant === 'basic') {
          return {
            ...common,
            backgroundColor: mode === 'dark' ? pmxPalette.dark.layout.background5 : pmxPalette.light.layout.base,
          };
        }

        if (ownerState.variant === 'selected') {
          return {
            ...common,
            backgroundColor: pmxPalette[mode].layout.background5,
            '&:hover': {
              borderColor: `${pmxPalette[mode].primary?.main}66`, // 40% alpha
            },
            '&:active': {
              borderColor: pmxPalette[mode].primary?.main,
            },
            '&.MuiPaper-root': {
              borderColor: `${pmxPalette[mode].primary?.main} !important`,
              backgroundColor:
                mode === 'dark' ? pmxPalette.dark.layout.background9 : pmxPalette.light.layout.background5,
            },
          };
        }

        return {
          ...common,
          backgroundColor: pmxPalette[mode].layout.background5,
          '&:hover': {
            borderColor: `${pmxPalette[mode].primary?.main}66`, // 40% alpha
          },
          '&:active': {
            borderColor: pmxPalette[mode].primary?.main,
          },
        };
      },
    },
  };
};
