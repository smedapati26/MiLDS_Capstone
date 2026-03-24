import { describe, expect, it } from 'vitest';

import { renderHook } from '@testing-library/react';

import { useBankTimeCalculations } from '@features/daily-status-report/hooks/useBankTimeCalculations';

import { IBankTimeForecast } from '@store/griffin_api/auto_dsr/models';

// Mock data for testing
const mockBankTimeData: IBankTimeForecast[] = [
  {
    model: 'CH-47F',
    projections: [
      { date: '2025-02-15', value: 80 }, // Current period
      { date: '2025-03-15', value: 75 }, // Next period
      { date: '2025-04-15', value: 70 },
    ],
  },
  {
    model: 'UH-60M',
    projections: [
      { date: '2025-02-15', value: 60 }, // Current period
      { date: '2025-03-15', value: 65 }, // Next period
      { date: '2025-04-15', value: 70 },
    ],
  },
];

const singleModelData: IBankTimeForecast[] = [
  {
    model: 'CH-47F',
    projections: [
      { date: '2025-02-15', value: 85 },
      { date: '2025-03-15', value: 80 },
    ],
  },
];

describe('useBankTimeCalculations', () => {
  it('calculates correct values for mock data', () => {
    const { result } = renderHook(() => useBankTimeCalculations(mockBankTimeData));

    expect(result.current).toEqual({
      percentage: 0.7, // (80 + 60) / 2 / 100 = 70 / 100 = 0.7
      projectedDifference: 0, // 70 - 70 = 0
    });
  });

  it('calculates correct values for single model data', () => {
    const { result } = renderHook(() => useBankTimeCalculations(singleModelData));

    expect(result.current).toEqual({
      percentage: 0.85, // 85 / 100 = 0.85
      projectedDifference: 5, // 85 - 80 = 5
    });
  });

  it('returns zeros for empty data', () => {
    const { result } = renderHook(() => useBankTimeCalculations([]));

    expect(result.current).toEqual({
      percentage: 0,
      projectedDifference: 0,
    });
  });

  it('returns zeros for undefined data', () => {
    const { result } = renderHook(() => useBankTimeCalculations(undefined));

    expect(result.current).toEqual({
      percentage: 0,
      projectedDifference: 0,
    });
  });

  it('handles positive projected difference', () => {
    const positiveData: IBankTimeForecast[] = [
      {
        model: 'CH-47F',
        projections: [
          { date: '2025-02-15', value: 90 }, // Current
          { date: '2025-03-15', value: 80 }, // Next
        ],
      },
    ];

    const { result } = renderHook(() => useBankTimeCalculations(positiveData));

    expect(result.current).toEqual({
      percentage: 0.9, // 90 / 100 = 0.9
      projectedDifference: 10, // 90 - 80 = 10
    });
  });

  it('handles negative projected difference', () => {
    const negativeData: IBankTimeForecast[] = [
      {
        model: 'CH-47F',
        projections: [
          { date: '2025-02-15', value: 60 }, // Current
          { date: '2025-03-15', value: 80 }, // Next
        ],
      },
    ];

    const { result } = renderHook(() => useBankTimeCalculations(negativeData));

    expect(result.current).toEqual({
      percentage: 0.6, // 60 / 100 = 0.6
      projectedDifference: -20, // 60 - 80 = -20
    });
  });

  it('memoizes results correctly', () => {
    const { result, rerender } = renderHook(({ data }) => useBankTimeCalculations(data), {
      initialProps: { data: mockBankTimeData },
    });

    const firstResult = result.current;

    // Rerender with same data
    rerender({ data: mockBankTimeData });
    const secondResult = result.current;

    // Results should be the same object reference due to memoization
    expect(firstResult).toBe(secondResult);
  });

  it('recalculates when data changes', () => {
    const { result, rerender } = renderHook(({ data }) => useBankTimeCalculations(data), {
      initialProps: { data: mockBankTimeData },
    });

    const firstResult = result.current;
    expect(firstResult.percentage).toBe(0.7);

    // Rerender with different data
    rerender({ data: singleModelData });
    const secondResult = result.current;

    expect(secondResult.percentage).toBe(0.85);
    expect(firstResult).not.toBe(secondResult);
  });

  it('handles complex multi-model scenarios', () => {
    const complexData: IBankTimeForecast[] = [
      {
        model: 'Model1',
        projections: [
          { date: '2025-02-15', value: 90 },
          { date: '2025-03-15', value: 85 },
        ],
      },
      {
        model: 'Model2',
        projections: [
          { date: '2025-02-15', value: 70 },
          { date: '2025-03-15', value: 75 },
        ],
      },
      {
        model: 'Model3',
        projections: [
          { date: '2025-02-15', value: 60 },
          { date: '2025-03-15', value: 70 },
        ],
      },
    ];

    const { result } = renderHook(() => useBankTimeCalculations(complexData));

    // Current average: (90 + 70 + 60) / 3 = 73.33 -> 73
    // Next average: (85 + 75 + 70) / 3 = 76.67 -> 77
    // Difference: 73 - 77 = -4
    expect(result.current).toEqual({
      percentage: 0.73, // 73 / 100 = 0.73
      projectedDifference: -4, // 73 - 77 = -4
    });
  });

  it('handles edge cases with zero values', () => {
    const zeroData: IBankTimeForecast[] = [
      {
        model: 'Model1',
        projections: [
          { date: '2025-02-15', value: 0 },
          { date: '2025-03-15', value: 0 },
        ],
      },
    ];

    const { result } = renderHook(() => useBankTimeCalculations(zeroData));

    expect(result.current).toEqual({
      percentage: 0,
      projectedDifference: 0,
    });
  });

  it('handles missing projection data gracefully', () => {
    const incompleteData: IBankTimeForecast[] = [
      {
        model: 'CH-47F',
        projections: [
          { date: '2025-02-15', value: 80 },
          // Missing next period projection
        ],
      },
    ];

    const { result } = renderHook(() => useBankTimeCalculations(incompleteData));

    expect(result.current).toEqual({
      percentage: 0.8, // 80 / 100 = 0.8
      projectedDifference: 80, // 80 - 0 = 80 (missing projection defaults to 0)
    });
  });
});
