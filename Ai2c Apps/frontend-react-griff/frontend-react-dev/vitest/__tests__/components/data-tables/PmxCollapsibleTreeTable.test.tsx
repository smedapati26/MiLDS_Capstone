import { describe, expect, it } from 'vitest';

import { fireEvent, screen } from '@testing-library/react';

import { ColumnConfig } from '@components/data-tables';
import { PmxCollapsibleTreeTable } from '@components/data-tables/PmxCollapsibleTreeTable';

import { renderWithTheme } from '@vitest/helpers/ThemedTestingComponent';

// Mock columns
const columns: ColumnConfig<{ id: string; parentId: string; level: number; name: string }>[] = [
  { key: 'name', label: 'Name' },
];

describe('PmxCollapsibleTreeTable', () => {
  const rows = [
    { id: '1', parentId: '', level: 0, name: 'Parent' },
    { id: '2', parentId: '1', level: 1, name: 'Child' },
  ];

  it('renders root rows initially', () => {
    renderWithTheme(<PmxCollapsibleTreeTable rows={rows} columns={columns} />);

    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.queryByText('Child')).not.toBeInTheDocument(); // hidden initially
  });

  it('expands and shows child rows when clicking expand button', () => {
    renderWithTheme(<PmxCollapsibleTreeTable rows={rows} columns={columns} />);

    const expandButton = screen.getByLabelText('expand row');
    fireEvent.click(expandButton);

    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('collapses and hides child rows when clicking expand again', () => {
    renderWithTheme(<PmxCollapsibleTreeTable rows={rows} columns={columns} />);

    const expandButton = screen.getByLabelText('expand row');

    // Expand
    fireEvent.click(expandButton);
    expect(screen.getByText('Child')).toBeInTheDocument();

    // Collapse
    fireEvent.click(expandButton);
    expect(screen.queryByText('Child')).not.toBeInTheDocument();
  });
});
