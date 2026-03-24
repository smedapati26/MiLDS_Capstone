import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiTable
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      root: {
        color: pmxPalette[mode].text?.primary,
        '& table': {
          backgroundColor: pmxPalette[mode].layout.base,
        },
        '& th': {
          backgroundColor: pmxPalette[mode].layout.background16,
        },
        '& tr': {
          transition: 'opacity 0.25s ease-in-out',
          backgroundColor: pmxPalette[mode].layout.background5,
        },
        '& tr:active': {
          backgroundColor:
            mode === 'dark'
              ? `${pmxPalette.dark.primary?.d60}!important`
              : `${pmxPalette.dark.primary?.l60} !important`,
        },
        '& tr:nth-of-type(even)': {
          backgroundColor: pmxPalette[mode].layout.base,
        },
        '& tr.MuiTableRow-root:hover': {
          backgroundColor:
            mode === 'dark'
              ? `${pmxPalette.dark.primary?.d60}99 !important`
              : `${pmxPalette.light.primary?.l60}99 !important`,
        },
        '& td': {
          borderBottom: 'none',
          fontWeight: 400,
        },
        '& .Mui-selected': {
          backgroundColor:
            mode === 'dark'
              ? `${pmxPalette.dark.primary?.d60}!important`
              : `${pmxPalette.dark.primary?.l60} !important`,
        },
      },
    },
  };
};
