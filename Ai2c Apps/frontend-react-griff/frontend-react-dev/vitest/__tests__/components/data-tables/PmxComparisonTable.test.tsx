import { describe, expect, it } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import { ColumnConfig } from '@components/data-tables';
import PmxComparisonTable from '@components/data-tables/PmxComparisonTable';

interface MockData {
  id: string;
  name: string;
}

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

const mockData: MockData[] = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' },
];

const mockNewData: MockData[] = [
  { id: '1', name: 'Item 0' },
  { id: '2', name: 'Item 2' },
];

const mockSectionedData: Record<string, MockData[]> = {
  Group1: mockData,
  Group2: [
    { id: '3', name: 'Item 3' },
    { id: '4', name: 'Item 4' },
  ],
};

const mockNewSectionedData: Record<string, MockData[]> = {
  ...mockSectionedData,
  Group1: mockNewData,
};

describe('PmxComparisonTable', () => {
  it('renders table without differences', () => {
    render(
      <ThemedTestingComponent>
        <PmxComparisonTable columns={mockColumns} data={mockData} comparativeData={mockData} sectioned={false} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('pmx-comparison-table')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.queryByText('Item 0')).not.toBeInTheDocument();

    expect(screen.queryByTestId(`0-1-diff`)).not.toBeInTheDocument();
  });

  it('renders table with differences', () => {
    render(
      <ThemedTestingComponent>
        <PmxComparisonTable columns={mockColumns} data={mockNewData} comparativeData={mockData} sectioned={false} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('pmx-comparison-table')).toBeInTheDocument();
    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();

    expect(screen.getByTestId(`0-1-diff`)).toBeInTheDocument();
  });
});

describe('PmxComparisonTable with sections', () => {
  it('renders table without differences', () => {
    render(
      <ThemedTestingComponent>
        <PmxComparisonTable
          columns={mockColumns}
          data={mockSectionedData}
          comparativeData={mockSectionedData}
          sectioned={true}
        />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('pmx-comparison-table')).toBeInTheDocument();
    expect(screen.getByText('Group1')).toBeInTheDocument();
    expect(screen.getByText('Group2')).toBeInTheDocument();

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.queryByText('Item 0')).not.toBeInTheDocument();

    expect(screen.queryByTestId(`0-1-diff`)).not.toBeInTheDocument();
  });

  it('renders table with differences', () => {
    render(
      <ThemedTestingComponent>
        <PmxComparisonTable
          columns={mockColumns}
          data={mockNewSectionedData}
          comparativeData={mockSectionedData}
          sectioned={true}
        />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('pmx-comparison-table')).toBeInTheDocument();
    expect(screen.getByText('Group1')).toBeInTheDocument();
    expect(screen.getByText('Group2')).toBeInTheDocument();

    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();

    expect(screen.getByTestId(`0-1-diff`)).toBeInTheDocument();
  });

  it('renders custom titles for section headers', () => {
    const keyTitleMapping = {
      Group1: <span>Custom Group 1</span>,
      Group2: <span>Custom Group 2</span>,
    };

    render(
      <ThemedTestingComponent>
        <PmxComparisonTable
          data={mockSectionedData}
          comparativeData={mockNewSectionedData}
          columns={mockColumns}
          sectioned={true}
          keyTitleMapping={keyTitleMapping}
        />
      </ThemedTestingComponent>,
    );

    // Check that custom titles are rendered
    expect(screen.getByText('Custom Group 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Group 2')).toBeInTheDocument();
  });
});
