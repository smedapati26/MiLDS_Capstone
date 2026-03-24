import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiDataGrid
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  const commonStyles = {
    '& td': {
      borderBottom: 'none',
    },
  };

  return {
    styleOverrides: {
      root:
        mode === 'dark'
          ? {
              // Dark mode
              ...commonStyles,
              '&.MuiDataGrid-columnHeaders': {
                backgroundColor: pmxPalette.dark.layout.base,
              },
              color: pmxPalette.dark.text?.primary,

              '& table': {
                backgroundColor: pmxPalette.dark.layout.base,
              },
              '& th': {
                backgroundColor: pmxPalette.dark.layout.base,
              },
              '& tr:nth-of-type(odd)': {
                backgroundColor: pmxPalette.dark.layout.background15,
              },
              '& td': {
                borderBottom: 'none',
              },
            }
          : {
              // Light mode
              ...commonStyles,
              color: pmxPalette.light.text?.primary,
              '&.MuiDataGrid-columnHeaders': {
                backgroundColor: pmxPalette.dark.layout.base,
              },
              '& table': {
                backgroundColor: pmxPalette.light.layout.base,
              },
              '& th': {
                backgroundColor: pmxPalette.light.layout.background16,
              },
              '& tr:nth-of-type(odd)': {
                backgroundColor: pmxPalette.light.layout.background5,
              },
            },
    },
  };
};
