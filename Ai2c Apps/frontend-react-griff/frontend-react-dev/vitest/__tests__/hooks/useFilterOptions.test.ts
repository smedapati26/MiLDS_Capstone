import { describe, expect, it } from 'vitest';

import { renderHook } from '@testing-library/react';

import { useFilterOptions } from '@hooks/useFilterOptions';
import { IOptions } from '@models/IOptions';

// Test data interface
interface TestData {
  id: number;
  name: string;
  category: string;
  score: number;
  isActive: boolean;
  tags: string[];
  nullable: string | null;
  optional?: string;
}

describe('useFilterOptions', () => {
  describe('Basic Functionality', () => {
    it('should return empty array when data is undefined', () => {
      const { result } = renderHook(() => useFilterOptions<TestData, 'name'>(undefined, 'name'));

      expect(result.current).toEqual([]);
    });

    it('should return empty array when data is empty', () => {
      const { result } = renderHook(() => useFilterOptions<TestData, 'name'>([], 'name'));

      expect(result.current).toEqual([]);
    });

    it('should extract unique string values from the specified field', () => {
      const data: TestData[] = [
        { id: 1, name: 'Alice', category: 'A', score: 85, isActive: true, tags: ['tag1'], nullable: 'not null' },
        { id: 2, name: 'Bob', category: 'B', score: 90, isActive: false, tags: ['tag2'], nullable: null },
        { id: 3, name: 'Alice', category: 'A', score: 95, isActive: true, tags: ['tag1'], nullable: 'not null' },
      ];

      const { result } = renderHook(() => useFilterOptions(data, 'name'));

      expect(result.current).toEqual([
        { value: 'Alice', label: 'Alice' },
        { value: 'Bob', label: 'Bob' },
      ]);
    });

    it('should sort the options alphabetically', () => {
      const data: TestData[] = [
        { id: 1, name: 'Charlie', category: 'A', score: 85, isActive: true, tags: [], nullable: null },
        { id: 2, name: 'Alice', category: 'B', score: 90, isActive: false, tags: [], nullable: null },
        { id: 3, name: 'Bob', category: 'A', score: 95, isActive: true, tags: [], nullable: null },
      ];

      const { result } = renderHook(() => useFilterOptions(data, 'name'));

      expect(result.current).toEqual([
        { value: 'Alice', label: 'Alice' },
        { value: 'Bob', label: 'Bob' },
        { value: 'Charlie', label: 'Charlie' },
      ]);
    });

    it('should handle different data types by converting to string', () => {
      const data: TestData[] = [
        { id: 1, name: 'User1', category: 'A', score: 85, isActive: true, tags: [], nullable: null },
        { id: 2, name: 'User2', category: 'B', score: 90, isActive: false, tags: [], nullable: null },
      ];

      const { result: scoreResult } = renderHook(() => useFilterOptions(data, 'score'));
      expect(scoreResult.current).toEqual([
        { value: '85', label: '85' },
        { value: '90', label: '90' },
      ]);

      const { result: activeResult } = renderHook(() => useFilterOptions(data, 'isActive'));
      expect(activeResult.current).toEqual([{ value: 'true', label: 'true' }]);
    });
  });

  describe('Edge Cases', () => {
    it('should skip falsy values: null, undefined, empty string, 0, false', () => {
      const data: TestData[] = [
        { id: 1, name: 'Alice', category: '', score: 0, isActive: false, tags: [], nullable: null },
        { id: 2, name: 'Bob', category: 'B', score: 90, isActive: true, tags: [], nullable: 'not null' },
        { id: 3, name: '', category: 'C', score: 95, isActive: true, tags: [], nullable: null },
      ];

      const { result: nameResult } = renderHook(() => useFilterOptions(data, 'name'));
      expect(nameResult.current).toEqual([
        { value: 'Alice', label: 'Alice' },
        { value: 'Bob', label: 'Bob' },
      ]);

      const { result: categoryResult } = renderHook(() => useFilterOptions(data, 'category'));
      expect(categoryResult.current).toEqual([
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
      ]);

      const { result: scoreResult } = renderHook(() => useFilterOptions(data, 'score'));
      expect(scoreResult.current).toEqual([
        { value: '90', label: '90' },
        { value: '95', label: '95' },
      ]);

      const { result: activeResult } = renderHook(() => useFilterOptions(data, 'isActive'));
      expect(activeResult.current).toEqual([{ value: 'true', label: 'true' }]);
    });

    it('should handle optional fields', () => {
      const data: TestData[] = [
        { id: 1, name: 'Alice', category: 'A', score: 85, isActive: true, tags: [], nullable: null, optional: 'opt1' },
        { id: 2, name: 'Bob', category: 'B', score: 90, isActive: false, tags: [], nullable: null },
      ];

      const { result } = renderHook(() => useFilterOptions(data, 'optional'));

      expect(result.current).toEqual([{ value: 'opt1', label: 'opt1' }]);
    });

    it('should handle arrays and objects by converting to string', () => {
      const data: TestData[] = [
        { id: 1, name: 'Alice', category: 'A', score: 85, isActive: true, tags: ['tag1', 'tag2'], nullable: null },
        { id: 2, name: 'Bob', category: 'B', score: 90, isActive: false, tags: ['tag3'], nullable: null },
      ];

      const { result } = renderHook(() => useFilterOptions(data, 'tags'));

      expect(result.current).toEqual([
        { value: 'tag1,tag2', label: 'tag1,tag2' },
        { value: 'tag3', label: 'tag3' },
      ]);
    });
  });

  describe('Memoization', () => {
    it('should memoize the result when data and field do not change', () => {
      const data: TestData[] = [
        { id: 1, name: 'Alice', category: 'A', score: 85, isActive: true, tags: [], nullable: null },
        { id: 2, name: 'Bob', category: 'B', score: 90, isActive: false, tags: [], nullable: null },
      ];

      const { result, rerender } = renderHook(({ data, field }) => useFilterOptions(data, field), {
        initialProps: { data, field: 'name' as const },
      });

      const firstResult = result.current;

      // Rerender with same props
      rerender({ data, field: 'name' as const });

      expect(result.current).toBe(firstResult); // Same reference due to memoization
    });

    it('should recompute when data changes', () => {
      const initialData: TestData[] = [
        { id: 1, name: 'Alice', category: 'A', score: 85, isActive: true, tags: [], nullable: null },
      ];

      const { result, rerender } = renderHook(({ data }) => useFilterOptions(data, 'name'), {
        initialProps: { data: initialData },
      });

      const firstResult = result.current;

      const newData: TestData[] = [
        { id: 1, name: 'Alice', category: 'A', score: 85, isActive: true, tags: [], nullable: null },
        { id: 2, name: 'Bob', category: 'B', score: 90, isActive: false, tags: [], nullable: null },
      ];

      rerender({ data: newData });

      expect(result.current).not.toBe(firstResult);
      expect(result.current).toEqual([
        { value: 'Alice', label: 'Alice' },
        { value: 'Bob', label: 'Bob' },
      ]);
    });

    it('should recompute when field changes', () => {
      const data: TestData[] = [
        { id: 1, name: 'Alice', category: 'A', score: 85, isActive: true, tags: [], nullable: null },
        { id: 2, name: 'Bob', category: 'B', score: 90, isActive: false, tags: [], nullable: null },
      ];

      const { result, rerender } = renderHook(({ field }: { field: keyof TestData }) => useFilterOptions(data, field), {
        initialProps: { field: 'name' },
      });

      const firstResult = result.current;

      rerender({ field: 'category' });

      expect(result.current).not.toBe(firstResult);
      expect(result.current).toEqual([
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
      ]);
    });
  });

  describe('Return Value Structure', () => {
    it('should return an array of IOptions with value and label as strings', () => {
      const data: TestData[] = [
        { id: 1, name: 'Alice', category: 'A', score: 85, isActive: true, tags: [], nullable: null },
      ];

      const { result } = renderHook(() => useFilterOptions(data, 'name'));

      expect(result.current).toBeInstanceOf(Array);
      result.current.forEach((option: IOptions) => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(typeof option.value).toBe('string');
        expect(typeof option.label).toBe('string');
        expect(option.value).toBe(option.label);
      });
    });
  });
});
