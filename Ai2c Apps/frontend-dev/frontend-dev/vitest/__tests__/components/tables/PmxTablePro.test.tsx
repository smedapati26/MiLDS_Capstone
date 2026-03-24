import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { Column } from '@components/PmxTable';
import { PmxTablePro } from '@components/tables';

// Mock components to isolate test
vi.mock('@components/PmxTable', () => ({
  PmxTable: vi.fn(({ data, filters }) => (
    <div>
      <div data-testid="pmx-table">{JSON.stringify(data)}</div>
      <div data-testid="filters">{filters}</div>
    </div>
  )),
}));

vi.mock('./PmxTableProFilters', () => ({
  default: vi.fn(() => <div data-testid="pmx-filters">Filters</div>),
}));

describe('PmxTablePro', () => {
  const mockData = [
    { name: 'Alpha', unit: 'Bravo' },
    { name: 'Charlie', unit: 'Delta' },
  ];
  const mockColumns: Column<{ name: string; unit: string }>[] = [
    { field: 'name', header: 'Name' },
    { field: 'unit', header: 'Unit' },
  ];
  const mockSetQuery = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the table title and passes data to table', () => {
    render(
      <PmxTablePro
        tableTitle="Test Table"
        tableProps={{
          data: mockData,
          columns: mockColumns,
          isLoading: false,
          tableTitle: '',
          getRowId: (row) => row.name,
        }}
        query=""
        setQuery={mockSetQuery}
        exportFileTitle="test-export"
      />,
    );

    expect(screen.getByText(/Test Table/i)).toBeInTheDocument();
    expect(screen.getByTestId('pmx-table').textContent).toContain('Alpha');
    expect(screen.getByTestId('pmx-table').textContent).toContain('Charlie');
  });
});
