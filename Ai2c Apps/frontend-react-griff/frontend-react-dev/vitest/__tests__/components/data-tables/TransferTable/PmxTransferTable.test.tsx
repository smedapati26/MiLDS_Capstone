/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';

import { ColumnConfig, PmxTransferTable } from '@components/data-tables';

// Mock PmxToolbarTable
vi.mock('@components/data-tables/TransferTable/PmxToolbarTable', () => ({
  PmxToolbarTable: ({ heading, columns, data, toolbar, searchable, isLoading }: any) => (
    <div data-testid={`pmx-toolbar-table-${heading}`}>
      <p>{heading || 'None'}</p>
      <p>{`Data Length: ${data.length}`}</p>
      <p>{`Columns: ${columns.length}`}</p>
      <p>{`Searchable: ${searchable ? 'true' : 'false'}`}</p>
      <p>{`Loading: ${isLoading ? 'true' : 'false'}`}</p>
      {toolbar && <div data-testid="toolbar">{toolbar}</div>}
    </div>
  ),
}));

// Define a simple type for testing
type TestData = { id: number; name: string };

describe('PmxTransferTable', () => {
  const mockLeftColumns: ColumnConfig<TestData>[] = [{ key: 'name', label: 'Name' }];
  const mockRightColumns: ColumnConfig<TestData>[] = [{ key: 'name', label: 'Name' }];
  const mockLeftData: TestData[] = [
    { id: 1, name: 'Left Item 1' },
    { id: 2, name: 'Left Item 2' },
  ];
  const mockRightData: TestData[] = [{ id: 3, name: 'Right Item 1' }];

  it('renders without crashing', () => {
    render(
      <PmxTransferTable
        leftColumns={mockLeftColumns}
        rightColumns={mockRightColumns}
        leftLabel="left"
        rightLabel="right"
      />,
    );
    expect(screen.getByTestId('pmx-toolbar-table-left')).toBeInTheDocument(); // Left table
    expect(screen.getByTestId('pmx-toolbar-table-right')).toBeInTheDocument(); // Right table
  });

  it('renders with labels and toolbars', () => {
    const leftToolbar = <div>Left Toolbar</div>;
    const rightToolbar = <div>Right Toolbar</div>;
    render(
      <PmxTransferTable
        leftColumns={mockLeftColumns}
        rightColumns={mockRightColumns}
        leftLabel="Left Table"
        rightLabel="Right Table"
        leftToolbar={leftToolbar}
        rightToolbar={rightToolbar}
      />,
    );
    expect(screen.getByText('Left Table')).toBeInTheDocument();
    expect(screen.getByText('Right Table')).toBeInTheDocument();
    expect(screen.getAllByTestId('toolbar')).toHaveLength(2);
    expect(screen.getByText('Left Toolbar')).toBeInTheDocument();
    expect(screen.getByText('Right Toolbar')).toBeInTheDocument();
  });

  it('syncs data with props via useEffect', async () => {
    render(
      <PmxTransferTable
        leftColumns={mockLeftColumns}
        rightColumns={mockRightColumns}
        leftData={mockLeftData}
        rightData={mockRightData}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Data Length: 1')).toBeInTheDocument(); // Left data updated
    });
  });

  it('disables transfer buttons when no items selected', () => {
    render(
      <PmxTransferTable
        leftColumns={mockLeftColumns}
        rightColumns={mockRightColumns}
        leftData={mockLeftData}
        rightData={mockRightData}
      />,
    );

    const transferLeftBtn = screen.getByRole('button', { name: 'transfer left' });
    const transferRightBtn = screen.getByRole('button', { name: 'transfer right' });

    expect(transferLeftBtn).toBeDisabled(); // No left selected
    expect(transferRightBtn).toBeDisabled(); // No
  });
});
