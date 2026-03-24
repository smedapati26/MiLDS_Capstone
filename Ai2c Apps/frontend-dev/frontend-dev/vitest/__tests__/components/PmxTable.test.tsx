import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { Column, PmxTable } from '@components/PmxTable';
import { readinessApiSlice } from '@store/amap_ai/readiness/slices/readinessApi';

type RowData = {
  name: string;
  age: number;
  email: string;
};

const sampleColumns: Column<RowData>[] = [
  { field: 'name', header: 'Name', width: '40%' },
  { field: 'age', header: 'Age', width: '20%' },
  { field: 'email', header: 'Email', width: '40%' },
];

const sampleData: RowData[] = [
  { name: 'Alice', age: 25, email: 'alice@example.com' },
  { name: 'Bob', age: 30, email: 'bob@example.com' },
  { name: 'Charlie', age: 22, email: 'charlie@example.com' },
];

const theme = createTheme({
  palette: {
    error: {
      light: '#ffcccc',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#ffffff',
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
const mockStore = configureStore({
  reducer: {
    [readinessApiSlice.reducerPath]: readinessApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(readinessApiSlice.middleware),
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={theme}>
        <MemoryRouter>{ui}</MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );
};

describe('PmxTable', () => {
  it('renders correctly with all columns and rows', () => {
    renderWithProviders(<PmxTable columns={sampleColumns} data={sampleData} getRowId={(row) => row.email} />);

    const table = screen.getByRole('table');

    // Verify column headers
    sampleColumns.forEach((column) => {
      expect(screen.getByText(column.header)).toBeInTheDocument();
    });

    // Verify rows and cells
    const rows = within(table).getAllByRole('row').slice(1); // Exclude the header row
    expect(rows).toHaveLength(sampleData.length);

    sampleData.forEach((row, rowIndex) => {
      const rowElement = rows[rowIndex];
      Object.values(row).forEach((cellValue) => {
        expect(within(rowElement).getByText(String(cellValue))).toBeInTheDocument();
      });
    });
  });

  it('calls sort when a column header is clicked', () => {
    renderWithProviders(<PmxTable columns={sampleColumns} data={sampleData} getRowId={(row) => row.email} />);

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
  });

  it('shows loading state when isLoading is true', () => {
    renderWithProviders(<PmxTable columns={sampleColumns} data={[]} isLoading getRowId={(row) => row.email} />);

    // Expect loading skeletons
    const skeletons = screen.getAllByRole('row');
    expect(skeletons).toHaveLength(12);
  });

  it('handles pagination', () => {
    renderWithProviders(<PmxTable columns={sampleColumns} data={sampleData} getRowId={(row) => row.email} />);

    const nextPageButton = screen.getByLabelText('Go to next page');
    fireEvent.click(nextPageButton);
  });
});
