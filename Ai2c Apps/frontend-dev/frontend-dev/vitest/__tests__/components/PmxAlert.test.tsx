import React from 'react';
import { describe, expect, it } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';

import PmxAlert from '@components/PmxAlert';

const theme = createTheme({
  palette: {
    mode: 'light',
    error: {
      d20: '#b71c1c',
      d40: '#c62828',
      l80: '#ef9a9a',
      l90: '#ffcdd2',
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#fff',
    },
    warning: {
      d20: '#f57c00',
      d40: '#ef6c00',
      d60: '#e65100',
      l80: '#ffe082',
      l90: '#ffecb3',
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#000',
    },
    info: {
      d20: '#0288d1',
      d40: '#0277bd',
      d60: '#01579b',
      l80: '#81d4fa',
      l90: '#b3e5fc',
      main: '#03a9f4',
      light: '#4fc3f7',
      dark: '#0288d1',
      contrastText: '#000',
    },
    success: {
      d20: '#2e7d32',
      d40: '#1b5e20',
      d60: '#004d40',
      l80: '#a5d6a7',
      l90: '#c8e6c9',
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#000',
    },
    text: {
      primary: '#212121',
    },
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
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
    avatar: '#1976d2',
    badge: '#ff5722',
    
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
  },
});

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('PmxAlert', () => {
  it('renders the alert with correct severity and content', () => {
    renderWithTheme(<PmxAlert severity="error">This is an error alert</PmxAlert>);
    expect(screen.getByText('This is an error alert')).toBeInTheDocument();
  });

  it('applies correct styles for "warning" severity', () => {
    renderWithTheme(<PmxAlert severity="warning">Warning alert here</PmxAlert>);
    const alert = screen.getByText('Warning alert here').parentElement;
    expect(alert).toHaveStyle(`background-color: ${theme.palette.warning.l80}`);
    expect(alert).toHaveStyle(`border: 1px solid ${theme.palette.warning.d20}`);
  });

  it('applies correct styles for "info" severity', () => {
    renderWithTheme(<PmxAlert severity="info">Info alert active</PmxAlert>);
    const alert = screen.getByText('Info alert active').parentElement;
    expect(alert).toHaveStyle(`background-color: ${theme.palette.info.l80}`);
    expect(alert).toHaveStyle(`border: 1px solid ${theme.palette.info.d20}`);
  });

  it('applies correct styles for "success" severity', () => {
    renderWithTheme(<PmxAlert severity="success">Success alert loaded</PmxAlert>);
    const alert = screen.getByText('Success alert loaded').parentElement;
    expect(alert).toHaveStyle(`background-color: ${theme.palette.success.l80}`);
    expect(alert).toHaveStyle(`border: 1px solid ${theme.palette.success.d20}`);
  });
});
