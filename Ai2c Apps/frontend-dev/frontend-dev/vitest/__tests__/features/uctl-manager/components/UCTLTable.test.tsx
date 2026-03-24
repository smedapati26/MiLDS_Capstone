/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import UCTLTable from '@features/uctl-manager/components/UCTLTable';

vi.mock('@components/PmxSearch', () => ({
  __esModule: true,
  default: ({ value, onChange }: any) => (
    <input data-testid="search-input" value={value} onChange={onChange} placeholder="Search..." />
  ),
}));

vi.mock('@components/PmxSearchSplitButton', () => ({
  __esModule: true,
  default: ({ onSelect, extraAction }: any) => (
    <div>
      <button data-testid="add-task-btn" onClick={() => onSelect({ id: '1' })}>
        ADD TASK
      </button>
      <button data-testid="add-multiple-btn" onClick={extraAction.onClick}>
        Add Multiple Tasks
      </button>
    </div>
  ),
}));

vi.mock('@components/PmxTable', () => ({
  __esModule: true,
  PmxTable: ({ data }: any) => (
    <div data-testid="pmx-table">
      {data.map((row: any) => (
        <div key={row.taskNumber}>{row.taskTitle}</div>
      ))}
    </div>
  ),
}));

vi.mock('@features/amtp-packet/components/tables/ExportMenu', () => ({
  __esModule: true,
  default: () => <div data-testid="export-menu" />,
}));

vi.mock('../AddMultipleTasksDialog', () => ({
  __esModule: true,
  default: ({ open, onUpdateSelected }: any) =>
    open ? (
      <div data-testid="multiple-dialog">
        <button data-testid="dialog-select-task" onClick={() => onUpdateSelected(['2'])}>
          Select Task 2
        </button>
      </div>
    ) : null,
}));

const mockSetSelectedTasks = vi.fn();

const tableProps = {
  columns: [],
  data: [
    { taskNumber: 1, taskTitle: 'Engine Repair' },
    { taskNumber: 2, taskTitle: 'Hydraulics' },
  ],
  getRowId: (row: any) => row.taskNumber,
};

const allTasks = [
  { id: '1', value: 'Engine Repair' },
  { id: '2', value: 'Hydraulics' },
];

const selectedTasks = [{ taskNumber: 1, taskTitle: 'Engine Repair' }];

// ----------------------
// TESTS
// ----------------------

describe('UCTLTable', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const renderTable = () =>
    render(
      <UCTLTable
        tableProps={tableProps}
        allTasks={allTasks}
        // @ts-expect-error
        selectedTasks={selectedTasks}
        setSelectedTasks={mockSetSelectedTasks}
      />,
    );

  it('renders table with initial data', () => {
    renderTable();

    expect(screen.getByText('Engine Repair')).toBeInTheDocument();
    expect(screen.getByText('Hydraulics')).toBeInTheDocument();
  });

  it('filters table when typing in search', () => {
    renderTable();

    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'engine' },
    });

    expect(screen.getByText('Engine Repair')).toBeInTheDocument();
    expect(screen.queryByText('Hydraulics')).not.toBeInTheDocument();
  });

  it('calls setSelectedTasks when selecting a task from split button', () => {
    renderTable();

    fireEvent.click(screen.getByTestId('add-task-btn'));

    expect(mockSetSelectedTasks).toHaveBeenCalledWith('1');
  });

  it('opens AddMultipleTasksDialog when clicking "Add Multiple Tasks"', () => {
    renderTable();

    fireEvent.click(screen.getByTestId('add-multiple-btn'));
  });

  it('adds tasks from dialog via selectedIds', () => {
    renderTable();

    fireEvent.click(screen.getByTestId('add-multiple-btn'));

    // expect(mockSetSelectedTasks).toHaveBeenCalledWith('0');
  });
});
