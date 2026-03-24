/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';

import { PmxGroupData, PmxGroupedTable } from '@components/tables';

type MockRow = {
  name: string;
  value: string;
};

const mockColumns = [
  { field: 'name', header: 'Name' },
  { field: 'value', header: 'Value' },
];

const mockData: PmxGroupData<MockRow> = [
  {
    id: 'group1',
    label: 'Group One',
    children: [
      { name: 'Item A', value: 'Alpha' },
      { name: 'Item B', value: 'Bravo' },
    ],
  },
  {
    id: 'group2',
    label: 'Group Two',
    children: [{ name: 'Item C', value: 'Charlie' }],
  },
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

const renderWithProviders = (ui: ReactNode) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>,
  );
};

describe('PmxGroupedTable', () => {
  let onSelectionChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSelectionChange = vi.fn();
  });

  it('renders group labels and child rows', () => {
    renderWithProviders(
      <PmxGroupedTable
        data={mockData}
        // @ts-expect-error
        columns={mockColumns}
        selectableRows
        selectedRows={[]}
        // @ts-expect-error
        onSelectionChange={onSelectionChange}
      />,
    );

    expect(screen.getByText('Group One')).toBeInTheDocument();
    expect(screen.getByText('Group Two')).toBeInTheDocument();
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Item C')).toBeInTheDocument();
  });

  it('toggles group expansion', () => {
    // @ts-expect-error
    renderWithProviders(<PmxGroupedTable data={mockData} columns={mockColumns} isExpandable />);

    const toggleButton = screen.getAllByRole('button')[0];
    fireEvent.click(toggleButton);

    expect(screen.queryByText('Item A')).not.toBeInTheDocument();
    expect(screen.queryByText('Item B')).not.toBeInTheDocument();
  });

  it('selects individual rows', () => {
    renderWithProviders(
      <PmxGroupedTable
        data={mockData}
        // @ts-expect-error
        columns={mockColumns}
        selectableRows
        selectedRows={[]}
        // @ts-expect-error
        onSelectionChange={onSelectionChange}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Select first row

    expect(onSelectionChange).toHaveBeenCalledWith([{ name: 'Item A', value: 'Alpha' }]);
  });

  it('selects all rows via header checkbox', () => {
    renderWithProviders(
      <PmxGroupedTable
        data={mockData}
        // @ts-expect-error
        columns={mockColumns}
        selectableRows
        selectedRows={[]}
        // @ts-expect-error
        onSelectionChange={onSelectionChange}
      />,
    );

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);

    expect(onSelectionChange).toHaveBeenCalledWith([
      { name: 'Item A', value: 'Alpha' },
      { name: 'Item B', value: 'Bravo' },
      { name: 'Item C', value: 'Charlie' },
    ]);
  });

  it('renders pagination controls', () => {
    // @ts-expect-error
    renderWithProviders(<PmxGroupedTable data={mockData} columns={mockColumns} />);

    expect(screen.getByText('Rows per page:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
  });
});
