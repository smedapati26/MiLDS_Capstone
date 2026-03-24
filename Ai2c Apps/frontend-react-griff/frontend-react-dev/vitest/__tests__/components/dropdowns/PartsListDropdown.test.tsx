import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import PartsListDropdown from '@features/component-management/components/Analytics/PartsListDropdown';

import { useGetComponentPartListQuery } from '@store/griffin_api/components/slices/componentsApi';

// Mock PmxMultiSelect
vi.mock('@components/PmxMultiSelect', () => ({
  default: ({
    label,
    values,
    options,
    loading,
    onChange,
    'data-testid': dataTestId,
    maxSelections,
  }: {
    label: string;
    values: string[];
    options: string[];
    loading?: boolean;
    onChange: (values: string[]) => void;
    'data-testid'?: string;
    maxSelections?: number;
  }) => (
    <div data-testid={dataTestId}>
      <label>{label}</label>
      <select
        multiple={maxSelections !== 1}
        value={values}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions, (option) => option.value);
          onChange(selected);
        }}
        data-testid="mock-select"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {loading && <div data-testid="loading">Loading...</div>}
    </div>
  ),
}));

// Mock the API slice
vi.mock('@store/griffin_api/components/slices/componentsApi', () => ({
  useGetComponentPartListQuery: vi.fn(),
}));

// Mock store slices
const mockAppSettingsReducer = (state = { currentUnit: { uic: 'TEST_UIC' } }) => state;

const createMockStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      appSettings: mockAppSettingsReducer,
    },
    preloadedState,
  });

describe('PartsListDropdown', () => {
  const mockHandleSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with loading when fetching data', () => {
    (useGetComponentPartListQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
    });

    const store = createMockStore();

    render(
      <Provider store={store}>
        <PartsListDropdown values={[]} handleSelect={mockHandleSelect} />
      </Provider>,
    );

    expect(screen.getByTestId('part-numbers-select')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders part numbers when data is loaded', () => {
    const mockData = [
      { part_number: 'PART1', models: ['MODEL1'] },
      { part_number: 'PART2', models: ['MODEL2'] },
    ];

    (useGetComponentPartListQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isLoading: false,
      isFetching: false,
    });

    const store = createMockStore();

    render(
      <Provider store={store}>
        <PartsListDropdown values={[]} handleSelect={mockHandleSelect} />
      </Provider>,
    );

    expect(screen.getByTestId('part-numbers-select')).toBeInTheDocument();
    expect(screen.getByText('Part Number')).toBeInTheDocument();
    expect(screen.getByTestId('mock-select')).toBeInTheDocument();
    // Check options
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveValue('PART1');
    expect(options[1]).toHaveValue('PART2');
  });

  it('passes correct props to PmxMultiSelect', () => {
    const mockData = [{ part_number: 'PART1', models: ['MODEL1'] }];

    (useGetComponentPartListQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isLoading: false,
      isFetching: false,
    });

    const store = createMockStore();

    render(
      <Provider store={store}>
        <PartsListDropdown values={['PART1']} handleSelect={mockHandleSelect} multiSelect />
      </Provider>,
    );

    expect(screen.getByTestId('part-numbers-select')).toBeInTheDocument();
    expect(screen.getByText('Part Number')).toBeInTheDocument();
  });

  it('uses uic from globalSelectedUnit', () => {
    const mockData = [{ part_number: 'PART1', models: ['MODEL1'] }];

    (useGetComponentPartListQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isLoading: false,
      isFetching: false,
    });

    const store = createMockStore({
      appSettings: { currentUnit: { uic: 'CUSTOM_UIC' } },
    });

    render(
      <Provider store={store}>
        <PartsListDropdown values={[]} handleSelect={mockHandleSelect} />
      </Provider>,
    );

    expect(useGetComponentPartListQuery).toHaveBeenCalledWith({ uic: 'CUSTOM_UIC' }, { skip: false });
  });
});
