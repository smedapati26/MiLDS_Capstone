import { Components, PaletteOptions, Theme } from '@mui/material';

import { createPmxPalette, PmxPalette } from '@ai2c/pmx-mui';

export const darkPalette: PaletteOptions = createPmxPalette('dark', {
  l60: '#B8DBFF',
  l40: '#94CAFF',
  l20: '#71B8FF',
  main: '#4DA6FF',
  d20: '#3E85CC',
  d40: '#2E6499',
  d60: '#1F4266',
  light: '#71B8FF',
  dark: '#3E85CC',
  contrastText: '#1A1A1A',
});

export const lightPalette: PaletteOptions = createPmxPalette('light', {
  l60: '#99C7F5',
  l40: '#66ABF0',
  l20: '#338FEB',
  main: '#0073E6',
  d20: '#005CB8',
  d40: '#00458A',
  d60: '#002E5C',
  light: '#338FEB',
  dark: '#005CB8',
  contrastText: '#FFFFFF',
});

export const amapPalette: PmxPalette = {
  dark: darkPalette,
  light: lightPalette,
};

export const amapComponents: Components<Theme> = {
  MuiTablePagination: {
    styleOverrides: {
      root: ({ theme }) => ({
        position: 'sticky',
        bottom: 0,
        '.MuiTablePagination-toolbar': {
          minHeight: '56px',
          padding: theme.spacing(0, 2),
          backgroundColor: theme.palette.mode === 'light' ? '#F2F2F2' : theme.palette.background.default,
        },
        '.MuiTablePagination-displayedRows': {
          margin: '0 auto',
          typography: 'body1',
        },
        '.MuiTablePagination-select': {
          typography: 'body1',
          marginTop: 0,
          paddingTop: '0',
          paddingBottom: '0',
          paddingRight: '24px',
          textAlign: 'center',
        },
        '.MuiTablePagination-selectLabel': {
          typography: 'body1',
        },
        '.MuiTablePagination-actions': {
          marginLeft: 6,
          '& .MuiIconButton-root:last-child': {
            marginLeft: 3,
          },
        },
      }),
    },
  },
  MuiAutocomplete: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiAutocomplete-popper': {
          maxHeight: '400px',
        },
        '& .MuiAutocomplete-paper': {
          backgroundColor:
            theme.palette.mode === 'dark' ? theme.palette.layout?.background7 : theme.palette.layout?.background5,
        },
        '& .MuiAutocomplete-listbox': {
          maxHeight: '400px',
          '& .MuiAutocomplete-option': {
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: theme.spacing(2),
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&[aria-selected="true"]': {
              backgroundColor: theme.palette.action.selected,
            },
          },
        },
      }),
    },
  },
  MuiAlert: {
    styleOverrides: {
      standardSuccess: ({ theme }) => ({
        backgroundColor: theme.palette.layout?.background11,
        color: theme.palette.mode !== 'dark' ? '#1A1A1A' : '#E6E6E6',
      }),
      filledSuccess: ({ theme }) => ({
        backgroundColor: theme.palette.layout?.background11,
        color: theme.palette.mode !== 'dark' ? '#1A1A1A' : '#E6E6E6',
      }),
      outlinedSuccess: ({ theme }) => ({
        borderColor: theme.palette.layout?.background11,
        color: theme.palette.mode !== 'dark' ? '#1A1A1A' : '#E6E6E6',
      }),
    },
  },
  MuiTypography: { styleOverrides: { root: ({ theme }) => ({ color: theme.palette.text.primary }) } },
};

export const extendTheme = (theme: Theme): Theme => ({
  ...theme,
  components: {
    ...(theme.components || {}),
    ...amapComponents,
  } as Components,
});
