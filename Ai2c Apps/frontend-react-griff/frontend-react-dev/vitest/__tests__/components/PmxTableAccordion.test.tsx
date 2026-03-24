import { describe, expect, it } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { fireEvent, render, screen } from '@testing-library/react';

import { ColumnConfig } from '@components/data-tables';
import PmxTableAccordion from '@components/PmxTableAccordion';

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

describe('PmxTableAccordion', () => {
  it('renders loading', () => {
    render(
      <ThemedTestingComponent>
        <PmxTableAccordion isLoading={true} columns={[]} data={{}} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('pmx-accordion-table-skeleton')).toBeInTheDocument();
  });
  it('renders table with accordion', () => {
    render(
      <ThemedTestingComponent>
        <PmxTableAccordion isLoading={false} columns={mockColumns} data={mockData} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('pmx-accordion-table')).toBeInTheDocument();
    expect(screen.getByText('Group1')).toBeInTheDocument();
    expect(screen.getByText('Group2')).toBeInTheDocument();
  });

  it('toggles all accordions when isAllExpanded changes', () => {
    const { rerender } = render(
      <ThemedTestingComponent>
        <PmxTableAccordion
          data={mockData}
          columns={mockColumns}
          isLoading={false}
          isAllExpanded={false} // Initially collapsed
        />
      </ThemedTestingComponent>,
    );

    // Initially, accordions should not be expanded
    expect(screen.queryByText('Item 1')).not.toBeVisible();
    expect(screen.queryByText('Item 2')).not.toBeVisible();
    expect(screen.queryByText('Item 3')).not.toBeVisible();
    expect(screen.queryByText('Item 4')).not.toBeVisible();

    // Rerender with isAllExpanded set to true
    rerender(
      <ThemedTestingComponent>
        <PmxTableAccordion
          data={mockData}
          columns={mockColumns}
          isLoading={false}
          isAllExpanded={true} // Expand all
        />
      </ThemedTestingComponent>,
    );

    // Now, all accordions should be expanded
    expect(screen.getByText('Item 1')).toBeVisible();
    expect(screen.getByText('Item 2')).toBeVisible();
    expect(screen.getByText('Item 3')).toBeVisible();
    expect(screen.getByText('Item 4')).toBeVisible();
  });

  it('handles checkbox selection', () => {
    const mockSetSelectedRows = vi.fn();
    const mockSelectedRows = { '1': true, '2': false, '3': false, '4': false };

    render(
      <ThemedTestingComponent>
        <PmxTableAccordion
          data={mockData}
          columns={mockColumns}
          isLoading={false}
          checkBox={true}
          selectedRows={mockSelectedRows}
          setSelectedRows={mockSetSelectedRows}
          rowKey="id"
        />
      </ThemedTestingComponent>,
    );

    const group1Checkbox = screen.getAllByRole('checkbox')[0]; // Group1 checkbox
    const item1Checkbox = screen.getAllByRole('checkbox')[1]; // Item 1 checkbox

    // Check Group1 checkbox
    fireEvent.click(group1Checkbox);
    expect(mockSetSelectedRows).toHaveBeenCalled();

    // Check Item 1 checkbox
    fireEvent.click(item1Checkbox);
    expect(mockSetSelectedRows).toHaveBeenCalled();
  });

  it('renders custom titles for accordion headers', () => {
    const keyTitleMapping = {
      Group1: <span>Custom Group 1</span>,
      Group2: <span>Custom Group 2</span>,
    };

    render(
      <ThemedTestingComponent>
        <PmxTableAccordion
          data={mockData}
          columns={mockColumns}
          isLoading={false}
          keyTitleMapping={keyTitleMapping}
          rowKey="id"
        />
      </ThemedTestingComponent>,
    );

    // Check that custom titles are rendered
    expect(screen.getByText('Custom Group 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Group 2')).toBeInTheDocument();
  });

  it('logs warnings when rowKey is not provided', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <ThemedTestingComponent>
        <PmxTableAccordion
          data={mockData}
          columns={mockColumns}
          isLoading={false}
          checkBox={true}
          selectedRows={{}}
          setSelectedRows={vi.fn()}
          rowKey={undefined} // rowKey is missing
        />
      </ThemedTestingComponent>,
    );

    // Check that warnings are logged
    expect(consoleWarnSpy).toHaveBeenCalledWith('rowKey is undefined and necessary for checkboxes');
    consoleWarnSpy.mockRestore();
  });

  it('logs warnings when selectedRows is not provided', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <ThemedTestingComponent>
        <PmxTableAccordion
          data={mockData}
          columns={mockColumns}
          isLoading={false}
          checkBox={true}
          selectedRows={undefined} // selectedRows is missing
          setSelectedRows={vi.fn()}
          rowKey="id"
        />
      </ThemedTestingComponent>,
    );

    // Check that warnings are logged
    expect(consoleWarnSpy).toHaveBeenCalledWith('selectRows dictionary is necessary');
    consoleWarnSpy.mockRestore();
  });
});
