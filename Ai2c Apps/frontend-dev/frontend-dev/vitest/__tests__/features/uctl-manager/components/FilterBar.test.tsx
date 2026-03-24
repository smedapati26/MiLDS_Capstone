/* eslint-disable sonarjs/no-nested-functions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import FilterBar from '@features/uctl-manager/components/FilterBar';
import { useLazyGetTasksByTypeQuery } from '@store/amap_ai/tasks/slices/tasksApi';

vi.mock('@hooks/useUnitAccess', () => ({
  default: () => ({
    hasRole: vi.fn().mockImplementation((role) => role === 'manager'),
  }),
}));

vi.mock('@store/amap_ai/tasks/slices/tasksApi', () => ({
  useLazyGetTasksByTypeQuery: vi.fn(),
}));

// Mock shared components so tests focus on FilterBar logic
vi.mock('@components/PmxSearch', () => ({
  __esModule: true,
  default: ({ value, onChange }: any) => (
    <input data-testid="pmx-search" value={value} onChange={onChange} placeholder="Search..." />
  ),
}));

vi.mock('@components/PmxSplitButton', () => ({
  __esModule: true,
  default: ({ handleClick, disabled }: any) => (
    <button data-testid="create-btn" disabled={disabled} onClick={() => handleClick('Create UCTL')}>
      CREATE
    </button>
  ),
}));

vi.mock('@components/PmxToggleBtnGroup', () => ({
  __esModule: true,
  default: ({ selected, onChange, buttons }: any) => (
    <div>
      {buttons.map((b: any) => (
        <button key={b.value} data-testid={`toggle-${b.value}`} onClick={() => onChange(b.value)}>
          {b.label}
        </button>
      ))}
      <span data-testid="selected-toggle">{selected}</span>
    </div>
  ),
}));

vi.mock('@components/UnitSelect', () => ({
  __esModule: true,
  UnitSelect: ({ onChange }: any) => (
    <select data-testid="unit-select" onChange={(e) => onChange({ uic: e.target.value })}>
      <option value="">Select Unit</option>
      <option value="A123">Unit A</option>
    </select>
  ),
}));

describe('FilterBar', () => {
  const mockFetch = vi.fn();
  const mockSetListView = vi.fn();
  const mockSetSearchQuery = vi.fn();
  const mockSetSelectedSearch = vi.fn();
  const mockOnRecentSearchClick = vi.fn();
  const mockOnRemoveRecent = vi.fn();
  const mockOnClearAllRecent = vi.fn();
  const mockHandleCreate = vi.fn();
  const mockSetSelectedUnit = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    (useLazyGetTasksByTypeQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      mockFetch,
      { data: null, isFetching: false },
    ]);
  });

  const renderFilterBar = (props: any = {}) =>
    render(
      <FilterBar
        listView="org"
        setListView={mockSetListView}
        searchQuery=""
        setSearchQuery={mockSetSearchQuery}
        selectedSearch={{ uic: '', title: '' }}
        setSelectedSearch={mockSetSelectedSearch}
        recentSearches={[]}
        onRecentSearchClick={mockOnRecentSearchClick}
        onRemoveRecent={mockOnRemoveRecent}
        onClearAllRecent={mockOnClearAllRecent}
        units={[]}
        selectedUnit={undefined}
        setSelectedUnit={mockSetSelectedUnit}
        handleCreate={mockHandleCreate}
        {...props}
      />,
    );

  it('renders header and toggle buttons', () => {
    renderFilterBar();

    expect(screen.getByText('Unit Critical Tasks List')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-org')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-list')).toBeInTheDocument();
  });

  it('updates search query when typing', () => {
    renderFilterBar();

    fireEvent.change(screen.getByTestId('pmx-search'), {
      target: { value: 'abc' },
    });

    expect(mockSetSearchQuery).toHaveBeenCalledWith('abc');
  });

  it('calls fetchResults when searchQuery >= 2', () => {
    renderFilterBar({ searchQuery: 'ab' });

    expect(mockFetch).toHaveBeenCalledWith({
      query: 'ab',
      search_type: 'UCTL',
    });
  });

  it('shows "No results found" when no results returned', () => {
    (useLazyGetTasksByTypeQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      mockFetch,
      { data: { uctlResults: [] }, isFetching: false },
    ]);

    renderFilterBar({ searchQuery: 'abcd' });

    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('renders recent searches when searchQuery < 3', () => {
    renderFilterBar({
      searchQuery: 'a',
      recentSearches: [{ text: 'Engine', addedAt: Date.now() }],
    });

    expect(screen.getByText('Recent Search')).toBeInTheDocument();
    expect(screen.getByText('Engine')).toBeInTheDocument();
  });

  it('clicking recent search triggers callback', () => {
    renderFilterBar({
      searchQuery: 'a',
      recentSearches: [{ text: 'Engine', addedAt: Date.now() }],
    });

    fireEvent.click(screen.getByText('Engine'));

    expect(mockOnRecentSearchClick).toHaveBeenCalledWith('Engine');
  });

  it('removing a recent search triggers callback', () => {
    renderFilterBar({
      searchQuery: 'a',
      recentSearches: [{ text: 'Engine', addedAt: Date.now() }],
    });

    fireEvent.click(screen.getByLabelText('Remove recent'));

    expect(mockOnRemoveRecent).toHaveBeenCalledWith('Engine');
  });

  it('create button disabled when user lacks role', () => {
    vi.mock('@hooks/useUnitAccess', () => ({
      default: () => ({
        hasRole: () => false,
      }),
    }));

    renderFilterBar();

    expect(screen.getByTestId('create-btn')).toBeDisabled();
  });

  it('unit selector updates selected unit', () => {
    renderFilterBar();

    fireEvent.change(screen.getByTestId('unit-select'), {
      target: { value: 'A123' },
    });

    expect(mockSetSelectedUnit).toHaveBeenCalledWith({ uic: 'A123' });
  });
});
