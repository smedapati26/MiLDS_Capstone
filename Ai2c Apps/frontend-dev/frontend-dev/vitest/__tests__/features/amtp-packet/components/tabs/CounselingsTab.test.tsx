import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';

import SnackbarProvider from '@context/SnackbarProvider';
import { createTheme, ThemeProvider } from '@mui/material';
import { screen } from '@testing-library/react';

import CounselingsTab from '@features/amtp-packet/components/tabs/CounselingsTab';

const theme = createTheme({
  palette: {
    layout: {
      base: '#FFFFFF',
      background5: '#F2F2F2',
      background7: '#EDEDED',
      background8: '#EBEBEB',
      background9: '#E8E8E8',
      background11: '#E3E3E3',
      background12: '#E0E0E0',
      background14: '#DBDBDB',
      background15: '#D9D9D9',
      background16: '#D6D6D6',
    },    
  graph: {
    purple: '#6929C4',
    cyan: '#0072B1',
    teal: '#005D5D',
    pink: '#9F1853',
    green: '#117D31',
    blue: '#002D9C',
    magenta: '#CE0094',
    yellow: '#8C6900',
    teal2: '#1C7877',
    cyan2: '#012749',
    orange: '#8A3800',
    purple2: '#7C58B7',
  },
  stacked_bars: {
    magenta: '#CE0094',
    blue: '#002D9C',
    cyan2: '#012749',
    teal2: '#1C7877',
    purple: '#6929C4',
  },
  classification: {
    unclassified: '#007A33',
    cui: '#502B85',
    confidential: '#0033A0',
    secret: '#C8102E',
    top_secret: '#FF8C00',
    top_secret_sci: '#FCE83A',
  },
  operational_readiness_status: {
    fmc: '#007A00',
    pmcs: '#664300',
    pmcm: '#996500',
    nmcs: '#EC0000',
    nmcm: '#BD0000',
    dade: '#007892',
  },
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
    avatar: '#1976d2',
    badge: '#ff5722',
  },
});

describe('CounselingTab Tests', () => {
  it('renders correctly with no UIC in the state', () => {
    renderWithProviders(<ThemeProvider theme={theme}><SnackbarProvider><MemoryRouter><CounselingsTab /></MemoryRouter></SnackbarProvider></ThemeProvider>);

    const divElements = screen.getByLabelText("Soldier Counselings Table");
    expect(divElements).toBeInTheDocument();
  });
});
