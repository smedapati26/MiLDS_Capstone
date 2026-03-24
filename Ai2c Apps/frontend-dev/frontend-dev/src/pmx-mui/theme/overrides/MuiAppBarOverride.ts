import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiAppBar
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      root: {
        zIndex: 1250,
        margin: 0,
        boxShadow: 'none',
        '& .MuiPaper-root': {
          '& .MuiAppBar-root': {
            elevation: 0,
          },
        },
        borderRadius: 0,
        border: 'none',
        color: pmxPalette[mode].text?.primary,
        backgroundColor: pmxPalette[mode].layout.background7,
        '& .MuiToolbar-root': {
          paddingLeft: '16px', // theme.spacing(4)
          paddingRight: '16px', // theme.spacing(4)
        },
      },
    },
  };
};
