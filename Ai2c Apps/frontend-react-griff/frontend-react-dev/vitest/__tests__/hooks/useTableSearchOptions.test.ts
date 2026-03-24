import dayjs from 'dayjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import { ColumnConfig } from '@components/data-tables/PmxTable';
import { useTableSearchOptions, UseTableSearchOptionsConfig } from '@hooks/useTableSearchOptions';

// Mock the roundDecimal utility
vi.mock('@utils/helpers', () => ({
  roundDecimal: vi.fn((value: number, precision: number) => {
    if (typeof value !== 'number' || isNaN(value)) return undefined;
    return value.toFixed(precision);
  }),
}));

// Test data types
interface TestData {
  id: number;
  name: string;
  age: number;
  isActive: boolean;
  score: number;
  createdAt: Date;
  updatedAt: dayjs.Dayjs;
  metadata: object;
  description?: string;
  nullValue: null;
  undefinedValue?: undefined;
  emptyString: string;
}

// Mock data
const mockData: TestData[] = [
  {
    id: 1,
    name: 'John Doe',
    age: 30,
    isActive: true,
    score: 85.5,
    createdAt: new Date('2023-01-01'),
    updatedAt: dayjs('2023-01-01'),
    metadata: { role: 'admin' },
    description: 'Test user 1',
    nullValue: null,
    emptyString: '',
  },
  {
    id: 2,
    name: 'Jane Smith',
    age: 25,
    isActive: false,
    score: 92.3,
    createdAt: new Date('2023-02-01'),
    updatedAt: dayjs('2023-02-01'),
    metadata: { role: 'user' },
    description: 'Test user 2',
    nullValue: null,
    emptyString: '',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    age: 35,
    isActive: true,
    score: 78.0,
    createdAt: new Date('2023-03-01'),
    updatedAt: dayjs('2023-03-01'),
    metadata: { role: 'moderator' },
    nullValue: null,
    emptyString: '',
  },
];

// Mock columns
const mockColumns: Array<ColumnConfig<TestData>> = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
  { key: 'isActive', label: 'Active' },
  { key: 'score', label: 'Score' },
  { key: 'createdAt', label: 'Created' },
  { key: 'updatedAt', label: 'Updated' },
  { key: 'metadata', label: 'Metadata' },
  { key: 'description', label: 'Description' },
  { key: 'nullValue', label: 'Null Value' },
  { key: 'undefinedValue', label: 'Undefined Value' },
  { key: 'emptyString', label: 'Empty String' },
];

describe('useTableSearchOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return empty array when no data is provided', () => {
      const { result } = renderHook(() => useTableSearchOptions(mockColumns, undefined));

      expect(result.current).toEqual([]);
    });

    it('should return empty array when data is empty', () => {
      const { result } = renderHook(() => useTableSearchOptions(mockColumns, []));

      expect(result.current).toEqual([]);
    });

    it('should extract unique values from data', () => {
      const { result } = renderHook(() => useTableSearchOptions(mockColumns, mockData));

      expect(result.current).toBeInstanceOf(Array);
      expect(result.current.length).toBeGreaterThan(0);

      // Check that all results have label and value properties
      result.current.forEach((option) => {
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('value');
        expect(typeof option.label).toBe('string');
        expect(typeof option.value).toBe('string');
      });
    });

    it('should return sorted options', () => {
      const { result } = renderHook(() => useTableSearchOptions(mockColumns, mockData));

      const values = result.current.map((option) => option.value);
      const sortedValues = [...values].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
      );

      expect(values).toEqual(sortedValues);
    });

    it('should handle duplicate values correctly', () => {
      const duplicateData = [
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'John', age: 30 },
        { id: 3, name: 'Jane', age: 25 },
      ];
      const columns: Array<ColumnConfig<(typeof duplicateData)[0]>> = [
        { key: 'name', label: 'Name' },
        { key: 'age', label: 'Age' },
      ];

      const { result } = renderHook(() => useTableSearchOptions(columns, duplicateData));

      const values = result.current.map((option) => option.value);
      const uniqueValues = [...new Set(values)];

      expect(values).toEqual(uniqueValues);
    });
  });

  describe('Data Type Formatting', () => {
    it('should format numbers correctly', () => {
      const numberData = [
        { id: 1, score: 85 },
        { id: 2, score: 92.5 },
      ];
      const columns: Array<ColumnConfig<(typeof numberData)[0]>> = [{ key: 'score', label: 'Score' }];

      const { result } = renderHook(() => useTableSearchOptions(columns, numberData));

      const scoreOptions = result.current.filter((option) => option.value === '85' || option.value === '92.50');

      expect(scoreOptions).toHaveLength(2);
    });

    it('should format booleans correctly', () => {
      const booleanData = [
        { id: 1, isActive: true },
        { id: 2, isActive: false },
      ];
      const columns: Array<ColumnConfig<(typeof booleanData)[0]>> = [{ key: 'isActive', label: 'Active' }];

      const { result } = renderHook(() => useTableSearchOptions(columns, booleanData));

      const booleanOptions = result.current.filter((option) => option.value === 'Yes' || option.value === 'No');

      expect(booleanOptions).toHaveLength(2);
      expect(booleanOptions.find((opt) => opt.value === 'Yes')).toBeDefined();
      expect(booleanOptions.find((opt) => opt.value === 'No')).toBeDefined();
    });

    it('should format dayjs objects correctly', () => {
      const dayjsData = [{ id: 1, updatedAt: dayjs('2023-01-01') }];
      const columns: Array<ColumnConfig<(typeof dayjsData)[0]>> = [{ key: 'updatedAt', label: 'Updated' }];

      const { result } = renderHook(() => useTableSearchOptions(columns, dayjsData));

      const dayjsOptions = result.current.filter((option) => option.value === '2023-01-01');

      expect(dayjsOptions).toHaveLength(1);
    });

    it('should format objects correctly', () => {
      const objectData = [{ id: 1, metadata: { role: 'admin', level: 5 } }];
      const columns: Array<ColumnConfig<(typeof objectData)[0]>> = [{ key: 'metadata', label: 'Metadata' }];

      const { result } = renderHook(() => useTableSearchOptions(columns, objectData));

      const objectOptions = result.current.filter(
        (option) => option.value.includes('role') && option.value.includes('admin'),
      );

      expect(objectOptions.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Options', () => {
    it('should respect includeColumns configuration', () => {
      const config: UseTableSearchOptionsConfig<TestData> = {
        includeColumns: ['name', 'age'],
      };

      const { result } = renderHook(() => useTableSearchOptions(mockColumns, mockData, config));

      // Should only include values from name and age columns
      const hasIdValues = result.current.some((option) => ['1', '2', '3'].includes(option.value));
      const hasNameValues = result.current.some((option) =>
        ['John Doe', 'Jane Smith', 'Bob Johnson'].includes(option.value),
      );
      const hasAgeValues = result.current.some((option) => ['30', '25', '35'].includes(option.value));

      expect(hasIdValues).toBe(false);
      expect(hasNameValues).toBe(true);
      expect(hasAgeValues).toBe(true);
    });

    it('should respect excludeColumns configuration', () => {
      const config: UseTableSearchOptionsConfig<TestData> = {
        excludeColumns: ['id', 'metadata'],
      };

      const { result } = renderHook(() => useTableSearchOptions(mockColumns, mockData, config));

      // Should not include values from id and metadata columns
      const hasIdValues = result.current.some((option) => ['1', '2', '3'].includes(option.value));
      const hasMetadataValues = result.current.some((option) => option.value.includes('role'));

      expect(hasIdValues).toBe(false);
      expect(hasMetadataValues).toBe(false);
    });

    it('should respect maxOptions configuration', () => {
      const config: UseTableSearchOptionsConfig<TestData> = {
        maxOptions: 5,
      };

      const { result } = renderHook(() => useTableSearchOptions(mockColumns, mockData, config));

      expect(result.current.length).toBeLessThanOrEqual(5);
    });

    it('should use custom valueFormatter when provided', () => {
      const config: UseTableSearchOptionsConfig<TestData> = {
        valueFormatter: (value, columnKey) => {
          if (columnKey === 'name') {
            return `Custom: ${value}`;
          }
          return String(value);
        },
      };

      const { result } = renderHook(() => useTableSearchOptions(mockColumns, mockData, config));

      const customFormattedOptions = result.current.filter((option) => option.value.startsWith('Custom:'));

      expect(customFormattedOptions.length).toBeGreaterThan(0);
    });

    it('should handle custom formatter errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const config: UseTableSearchOptionsConfig<TestData> = {
        valueFormatter: () => {
          throw new Error('Formatter error');
        },
      };

      const { result } = renderHook(() => useTableSearchOptions(mockColumns, mockData, config));

      expect(result.current).toBeInstanceOf(Array);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should skip null values', () => {
      const nullData = [
        { id: 1, name: null as string | null },
        { id: 2, name: 'John' },
      ];
      const columns: Array<ColumnConfig<(typeof nullData)[0]>> = [{ key: 'name', label: 'Name' }];

      const { result } = renderHook(() => useTableSearchOptions(columns, nullData));

      const nullOptions = result.current.filter((option) => option.value === 'null' || option.value === '');

      expect(nullOptions).toHaveLength(0);
    });

    it('should skip undefined values', () => {
      const undefinedData = [
        { id: 1, name: undefined as string | undefined },
        { id: 2, name: 'John' },
      ];
      const columns: Array<ColumnConfig<(typeof undefinedData)[0]>> = [{ key: 'name', label: 'Name' }];

      const { result } = renderHook(() => useTableSearchOptions(columns, undefinedData));

      const undefinedOptions = result.current.filter((option) => option.value === 'undefined' || option.value === '');

      expect(undefinedOptions).toHaveLength(0);
    });

    it('should skip empty string values', () => {
      const emptyStringData = [
        { id: 1, name: '' },
        { id: 2, name: 'John' },
      ];
      const columns: Array<ColumnConfig<(typeof emptyStringData)[0]>> = [{ key: 'name', label: 'Name' }];

      const { result } = renderHook(() => useTableSearchOptions(columns, emptyStringData));

      const emptyOptions = result.current.filter((option) => option.value === '');

      expect(emptyOptions).toHaveLength(0);
    });

    it('should handle empty columns array', () => {
      const { result } = renderHook(() => useTableSearchOptions([], mockData));

      expect(result.current).toEqual([]);
    });

    it('should handle data with missing properties', () => {
      const incompleteData = [
        { id: 1, name: 'John' },
        { id: 2 } as { id: number; name?: string }, // missing name property
      ];
      const columns: Array<ColumnConfig<{ id: number; name?: string }>> = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
      ];

      const { result } = renderHook(() => useTableSearchOptions(columns, incompleteData));

      expect(result.current).toBeInstanceOf(Array);
      expect(result.current.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        value: Math.random(),
      }));
      const columns: Array<ColumnConfig<(typeof largeData)[0]>> = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'value', label: 'Value' },
      ];

      const startTime = performance.now();
      const { result } = renderHook(() => useTableSearchOptions(columns, largeData, { maxOptions: 100 }));
      const endTime = performance.now();

      expect(result.current).toBeInstanceOf(Array);
      expect(result.current.length).toBeLessThanOrEqual(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should break early when maxOptions is reached', () => {
      const config: UseTableSearchOptionsConfig<TestData> = {
        maxOptions: 2,
      };

      const { result } = renderHook(() => useTableSearchOptions(mockColumns, mockData, config));

      expect(result.current.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Memoization', () => {
    it('should memoize results when inputs do not change', () => {
      const { result, rerender } = renderHook(
        ({ columns, data, config }) => useTableSearchOptions(columns, data, config),
        {
          initialProps: {
            columns: mockColumns,
            data: mockData,
            config: {} as UseTableSearchOptionsConfig<TestData>,
          },
        },
      );

      const firstResult = result.current;

      // Rerender with same props
      rerender({
        columns: mockColumns,
        data: mockData,
        config: {},
      });

      expect(result.current).toStrictEqual(firstResult); // Should be the same reference
    });

    it('should recalculate when data changes', () => {
      const { result, rerender } = renderHook(({ data }) => useTableSearchOptions(mockColumns, data), {
        initialProps: { data: mockData },
      });

      const firstResult = result.current;

      // Rerender with different data
      const newData = [
        {
          id: 999,
          name: 'New User',
          age: 40,
          isActive: true,
          score: 95.0,
          createdAt: new Date(),
          updatedAt: dayjs(),
          metadata: {},
          nullValue: null,
          emptyString: '',
        },
      ];
      rerender({ data: newData });

      expect(result.current).not.toBe(firstResult);
    });

    it('should recalculate when config changes', () => {
      const { result, rerender } = renderHook(({ config }) => useTableSearchOptions(mockColumns, mockData, config), {
        initialProps: { config: {} as UseTableSearchOptionsConfig<TestData> },
      });

      const firstResult = result.current;

      // Rerender with different config
      rerender({ config: { maxOptions: 5 } });

      expect(result.current).not.toBe(firstResult);
    });
  });

  describe('Return Value Structure', () => {
    it('should return array of objects with label and value properties', () => {
      const { result } = renderHook(() => useTableSearchOptions(mockColumns, mockData));

      result.current.forEach((option) => {
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('value');
        expect(option.label).toBe(option.value); // Default behavior
      });
    });

    it('should ensure all values are strings', () => {
      const { result } = renderHook(() => useTableSearchOptions(mockColumns, mockData));

      result.current.forEach((option) => {
        expect(typeof option.value).toBe('string');
        expect(typeof option.label).toBe('string');
      });
    });
  });
});
