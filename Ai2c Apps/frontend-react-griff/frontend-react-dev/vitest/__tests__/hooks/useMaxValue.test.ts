import { describe, expect, it } from 'vitest';

import { renderHook } from '@testing-library/react';

import { useMaxValue } from '@hooks/useMaxValue';

// Test data interface
interface TestData {
  value: number;
  score: number;
  name: string;
}

describe('useMaxValue', () => {
  describe('Basic Functionality', () => {
    it('should return 0 when data is undefined', () => {
      const { result } = renderHook(() => useMaxValue<TestData, 'value'>(undefined, 'value'));

      expect(result.current).toBe(0);
    });

    it('should return 0 when data is empty', () => {
      const { result } = renderHook(() => useMaxValue<TestData, 'value'>([], 'value'));

      expect(result.current).toBe(0);
    });

    it('should calculate the maximum value and round up to the nearest multiple of 5', () => {
      const data: TestData[] = [
        { value: 12, score: 85, name: 'Alice' },
        { value: 18, score: 90, name: 'Bob' },
        { value: 15, score: 95, name: 'Charlie' },
      ];

      const { result } = renderHook(() => useMaxValue(data, 'value'));

      expect(result.current).toBe(20); // max 18, ceil(18/5)*5 = 20
    });

    it('should handle decimal values by rounding to nearest integer first', () => {
      const data: TestData[] = [
        { value: 12.3, score: 85, name: 'Alice' },
        { value: 17.7, score: 90, name: 'Bob' },
      ];

      const { result } = renderHook(() => useMaxValue(data, 'value'));

      expect(result.current).toBe(20); // round 12.3->12, 17.7->18, max 18, ceil(18/5)*5=20
    });

    it('should work with different numeric fields', () => {
      const data: TestData[] = [
        { value: 10, score: 85, name: 'Alice' },
        { value: 20, score: 92, name: 'Bob' },
      ];

      const { result: valueResult } = renderHook(() => useMaxValue(data, 'value'));
      expect(valueResult.current).toBe(20);

      const { result: scoreResult } = renderHook(() => useMaxValue(data, 'score'));
      expect(scoreResult.current).toBe(95); // 92->95
    });
  });

  describe('Edge Cases', () => {
    it('should handle single item', () => {
      const data: TestData[] = [{ value: 13, score: 85, name: 'Alice' }];

      const { result } = renderHook(() => useMaxValue(data, 'value'));

      expect(result.current).toBe(15); // 13 -> 15
    });

    it('should handle values already multiple of 5', () => {
      const data: TestData[] = [
        { value: 10, score: 85, name: 'Alice' },
        { value: 15, score: 90, name: 'Bob' },
      ];

      const { result } = renderHook(() => useMaxValue(data, 'value'));

      expect(result.current).toBe(15);
    });

    it('should handle zero values', () => {
      const data: TestData[] = [
        { value: 0, score: 85, name: 'Alice' },
        { value: 3, score: 90, name: 'Bob' },
      ];

      const { result } = renderHook(() => useMaxValue(data, 'value'));

      expect(result.current).toBe(5); // max 3, ceil(3/5)*5=5
    });
  });

  describe('Memoization', () => {
    it('should memoize the result when data and field do not change', () => {
      const data: TestData[] = [
        { value: 12, score: 85, name: 'Alice' },
        { value: 18, score: 90, name: 'Bob' },
      ];

      const { result, rerender } = renderHook(({ data, field }) => useMaxValue(data, field), {
        initialProps: { data, field: 'value' as const },
      });

      const firstResult = result.current;

      // Rerender with same props
      rerender({ data, field: 'value' as const });

      expect(result.current).toBe(firstResult); // Same value due to memoization
    });

    it('should recompute when data changes', () => {
      const initialData: TestData[] = [{ value: 10, score: 85, name: 'Alice' }];

      const { result, rerender } = renderHook(({ data }) => useMaxValue(data, 'value'), {
        initialProps: { data: initialData },
      });

      const firstResult = result.current;

      const newData: TestData[] = [
        { value: 10, score: 85, name: 'Alice' },
        { value: 18, score: 90, name: 'Bob' },
      ];

      rerender({ data: newData });

      expect(result.current).not.toBe(firstResult);
      expect(result.current).toBe(20);
    });

    it('should recompute when field changes', () => {
      const data: TestData[] = [
        { value: 10, score: 85, name: 'Alice' },
        { value: 18, score: 90, name: 'Bob' },
      ];

      const { result, rerender } = renderHook(({ field }: { field: keyof TestData }) => useMaxValue(data, field), {
        initialProps: { field: 'value' },
      });

      const firstResult = result.current;

      rerender({ field: 'score' });

      expect(result.current).not.toBe(firstResult);
      expect(result.current).toBe(90); // score 90 -> 90, ceil(90/5)*5=90
    });
  });

  describe('Return Value', () => {
    it('should return a number', () => {
      const data: TestData[] = [{ value: 13, score: 85, name: 'Alice' }];

      const { result } = renderHook(() => useMaxValue(data, 'value'));

      expect(typeof result.current).toBe('number');
    });
  });
});
