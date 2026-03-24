import React from 'react';
import { describe, expect, it } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';

import { Column } from '@components/PmxTable';
import { PmxTableBasic } from '@components/tables';

type TestRow = {
  name: string;
  value: number;
};

const columns = [
  { field: 'name', header: 'Name' },
  { field: 'value', header: 'Value' },
];

const data: TestRow[] = [
  { name: 'Alpha', value: 42 },
  { name: 'Beta', value: 99 },
];

const theme = createTheme({
  palette: {
    mode: 'light',
    stacked_bars: {
      magenta: '#D81B60',
      blue: '#1E88E5',
      cyan2: '#00ACC1',
      teal2: '#00897B',
      purple: '#8E24AA',
    },
    classification: {
      unclassified: '#9E9E9E',
      cui: '#4CAF50',
      confidential: '#2196F3',
      secret: '#FF9800',
      top_secret: '#F44336',
      top_secret_sci: '#6A1B9A',
    },
    operational_readiness_status: {
      fmc: '#4CAF50',
      pmcs: '#FFEB3B',
      pmcm: '#FFC107',
      nmcs: '#FF5722',
      nmcm: '#F44336',
      dade: '#9C27B0',
    },
    graph: {
      purple: '#800080',
      cyan: '#00FFFF',
      teal: '#008080',
      pink: '#FFC0CB',
      green: '#008000',
      blue: '#0000FF',
      magenta: '#FF00FF',
      yellow: '#FFFF00',
      teal2: '#005D5D',
      cyan2: '#0072B1',
      orange: '#FFA500',
      purple2: '#9370DB',
    },
    layout: {
      base: '#ffffff',
      background5: '#f5f5f5',
      background7: '#eeeeee',
      background8: '#e0e0e0',
      background9: '#d6d6d6',
      background11: 'rgba(224, 224, 224, 1)',
      background12: '#cccccc',
      background14: '#bdbdbd',
      background15: '#a9a9a9',
      background16: '#999999',
    },
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
    avatar: '#1976d2',
    badge: '#ff5722',
  },
});

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('PmxTableBasic', () => {
  it('renders column headers', () => {
    renderWithTheme(<PmxTableBasic columns={columns} data={[]} loading={false} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('renders skeletons when loading is true', () => {
    renderWithTheme(<PmxTableBasic columns={columns} data={[]} loading={true} />);
    const skeletons = screen.getAllByRole('progressbar');
    expect(skeletons.length).toBe(10); // 5 rows × 2 columns
  });

  it('renders data rows when loading is false', () => {
    renderWithTheme(<PmxTableBasic columns={columns as Column<TestRow>[]} data={data} loading={false} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('applies correct background color from theme', () => {
    renderWithTheme(<PmxTableBasic columns={columns as Column<TestRow>[]} data={data} loading={false} />);
    const tableCells = screen.getAllByRole('cell');
    tableCells.forEach((cell) => {
      expect(cell).toHaveStyle(`background-color: ${theme.palette.layout.background11}`);
    });
  });
});
