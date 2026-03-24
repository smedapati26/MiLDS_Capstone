/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { PmxToolbarTable } from '@components/data-tables';

// Mock external dependencies
vi.mock('@ai2c/pmx-mui', () => ({
  SearchBar: ({ onChange, styles }: any) => (
    <input data-testid="search-bar" onChange={(e) => onChange(null, { value: e.target.value })} style={styles} />
  ),
}));

vi.mock('@hooks/useTableSearchFilter', () => ({
  useTableSearchFilter: vi.fn(() => ({
    setSearchQuery: vi.fn(),
    filteredData: [{ id: 1, name: 'Test' }],
  })),
}));

vi.mock('@hooks/useTableSearchOptions', () => ({
  useTableSearchOptions: vi.fn(() => [{ label: 'Option 1', value: '1' }]),
}));

// Define a simple type for testing
type TestData = { id: number; name: string };

describe('PmxToolbarTable', () => {
  const mockColumns: any[] = [{ key: 'name', label: 'Name' }];
  const mockData: TestData[] = [{ id: 1, name: 'Test' }];

  it('renders PmxTable without crashing', () => {
    render(<PmxToolbarTable columns={mockColumns} data={mockData} />);
    expect(screen.getByTestId('pmx-table')).toBeInTheDocument();
  });

  it('renders heading when provided', () => {
    render(<PmxToolbarTable columns={mockColumns} data={mockData} heading="Test Heading" />);
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });

  it('does not render heading when not provided', () => {
    render(<PmxToolbarTable columns={mockColumns} data={mockData} />);
    expect(screen.queryByText('Test Heading')).not.toBeInTheDocument();
  });

  it('renders toolbar when provided', () => {
    const toolbar = <div data-testid="custom-toolbar">Toolbar</div>;
    render(<PmxToolbarTable columns={mockColumns} data={mockData} toolbar={toolbar} />);
    expect(screen.getByTestId('custom-toolbar')).toBeInTheDocument();
  });

  it('renders SearchBar when searchable is true (default)', () => {
    render(<PmxToolbarTable columns={mockColumns} data={mockData} />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('does not render SearchBar when searchable is false', () => {
    render(<PmxToolbarTable columns={mockColumns} data={mockData} searchable={false} />);
    expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
  });
});
