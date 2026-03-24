import { describe, expect, it } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import { ColumnConfig } from '@components/data-tables';
import PmxSectionedTable from '@components/data-tables/PmxSectionedTable';

interface MockData {
  id: string;
  name: string;
}

const mockData: Record<string, MockData[]> = {
  Group1: [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
  ],
  Group2: [
    { id: '3', name: 'Item 3' },
    { id: '4', name: 'Item 4' },
  ],
};

const mockColumns: ColumnConfig<MockData>[] = [
  {
    label: 'ID',
    key: 'id',
    render: (value: MockData['id']) => value, // Use the column value directly
  },
  {
    label: 'Name',
    key: 'name',
    render: (value: MockData['name']) => value, // Use the column value directly
  },
];

describe('PmxSectionedTable', () => {
  it('renders table with sections', () => {
    render(
      <ThemedTestingComponent>
        <PmxSectionedTable columns={mockColumns} data={mockData} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('pmx-sectioned-table')).toBeInTheDocument();
    expect(screen.getByText('Group1')).toBeInTheDocument();
    expect(screen.getByText('Group2')).toBeInTheDocument();
  });

  it('renders custom titles for section headers', () => {
    const keyTitleMapping = {
      Group1: <span>Custom Group 1</span>,
      Group2: <span>Custom Group 2</span>,
    };

    render(
      <ThemedTestingComponent>
        <PmxSectionedTable data={mockData} columns={mockColumns} keyTitleMapping={keyTitleMapping} />
      </ThemedTestingComponent>,
    );

    // Check that custom titles are rendered
    expect(screen.getByTestId('pmx-sectioned-table')).toBeInTheDocument();
    expect(screen.getByText('Custom Group 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Group 2')).toBeInTheDocument();
  });
});
