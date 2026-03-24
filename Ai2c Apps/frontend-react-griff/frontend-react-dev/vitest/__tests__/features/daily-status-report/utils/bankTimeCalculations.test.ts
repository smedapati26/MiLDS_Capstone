import { describe, expect, it } from 'vitest';

import {
  calculateBankTimeMetrics,
  calculateBankTimePercentage,
  calculatePeriodAverage,
  calculateProjectedDifference,
  REPORTING_PERIODS,
} from '@features/daily-status-report/utils/bankTimeCalculations';

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

describe('bankTimeCalculations', () => {
  describe('REPORTING_PERIODS constants', () => {
    it('should have correct period indices', () => {
      expect(REPORTING_PERIODS.CURRENT).toBe(0);
      expect(REPORTING_PERIODS.NEXT).toBe(1);
    });
  });

  describe('calculatePeriodAverage', () => {
    it('calculates correct average for current period', () => {
      const result = calculatePeriodAverage(mockBankTimeData, REPORTING_PERIODS.CURRENT);
      // (80 + 60) / 2 = 70
      expect(result).toBe(70);
    });

    it('calculates correct average for next period', () => {
      const result = calculatePeriodAverage(mockBankTimeData, REPORTING_PERIODS.NEXT);
      // (75 + 65) / 2 = 70
      expect(result).toBe(70);
    });

    it('handles single model data', () => {
      const result = calculatePeriodAverage(singleModelData, REPORTING_PERIODS.CURRENT);
      expect(result).toBe(85);
    });

    it('returns 0 for empty data', () => {
      const result = calculatePeriodAverage([], REPORTING_PERIODS.CURRENT);
      expect(result).toBe(0);
    });

    it('returns 0 for undefined data', () => {
      const result = calculatePeriodAverage(undefined as unknown as IBankTimeForecast[], REPORTING_PERIODS.CURRENT);
      expect(result).toBe(0);
    });

    it('handles missing projection values gracefully', () => {
      const dataWithMissingValues: IBankTimeForecast[] = [
        {
          model: 'CH-47F',
          projections: [
            { date: '2025-02-15', value: 80 },
            // Missing next period projection
          ],
        },
      ];
      const result = calculatePeriodAverage(dataWithMissingValues, REPORTING_PERIODS.NEXT);
      expect(result).toBe(0);
    });

    it('rounds to nearest integer', () => {
      const dataWithDecimals: IBankTimeForecast[] = [
        {
          model: 'Model1',
          projections: [{ date: '2025-02-15', value: 33 }],
        },
        {
          model: 'Model2',
          projections: [{ date: '2025-02-15', value: 34 }],
        },
      ];
      const result = calculatePeriodAverage(dataWithDecimals, REPORTING_PERIODS.CURRENT);
      // (33 + 34) / 2 = 33.5, rounded = 34
      expect(result).toBe(34);
    });
  });

  describe('calculateProjectedDifference', () => {
    it('calculates correct difference for mock data', () => {
      const result = calculateProjectedDifference(mockBankTimeData);
      // Current: 70, Next: 70, Difference: 0
      expect(result).toBe(0);
    });

    it('calculates positive difference', () => {
      const positiveData: IBankTimeForecast[] = [
        {
          model: 'CH-47F',
          projections: [
            { date: '2025-02-15', value: 80 }, // Current
            { date: '2025-03-15', value: 70 }, // Next
          ],
        },
      ];
      const result = calculateProjectedDifference(positiveData);
      // 80 - 70 = 10
      expect(result).toBe(10);
    });

    it('calculates negative difference', () => {
      const negativeData: IBankTimeForecast[] = [
        {
          model: 'CH-47F',
          projections: [
            { date: '2025-02-15', value: 60 }, // Current
            { date: '2025-03-15', value: 80 }, // Next
          ],
        },
      ];
      const result = calculateProjectedDifference(negativeData);
      // 60 - 80 = -20
      expect(result).toBe(-20);
    });

    it('returns 0 for empty data', () => {
      const result = calculateProjectedDifference([]);
      expect(result).toBe(0);
    });
  });

  describe('calculateBankTimePercentage', () => {
    it('calculates correct percentage', () => {
      const result = calculateBankTimePercentage(mockBankTimeData);
      // Current average: 70, Percentage: 70/100 = 0.7
      expect(result).toBe(0.7);
    });

    it('handles single model data', () => {
      const result = calculateBankTimePercentage(singleModelData);
      // Current: 85, Percentage: 85/100 = 0.85
      expect(result).toBe(0.85);
    });

    it('returns 0 for empty data', () => {
      const result = calculateBankTimePercentage([]);
      expect(result).toBe(0);
    });
  });

  describe('calculateBankTimeMetrics', () => {
    it('calculates all metrics correctly', () => {
      const result = calculateBankTimeMetrics(mockBankTimeData);
      expect(result).toEqual({
        percentage: 0.7, // 70/100
        projectedDifference: 0, // 70 - 70
      });
    });

    it('handles single model data', () => {
      const result = calculateBankTimeMetrics(singleModelData);
      expect(result).toEqual({
        percentage: 0.85, // 85/100
        projectedDifference: 5, // 85 - 80
      });
    });

    it('returns zeros for empty data', () => {
      const result = calculateBankTimeMetrics([]);
      expect(result).toEqual({
        percentage: 0,
        projectedDifference: 0,
      });
    });

    it('returns zeros for undefined data', () => {
      const result = calculateBankTimeMetrics(undefined);
      expect(result).toEqual({
        percentage: 0,
        projectedDifference: 0,
      });
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
      const result = calculateBankTimeMetrics(complexData);
      // Current average: (90 + 70 + 60) / 3 = 73.33 -> 73
      // Next average: (85 + 75 + 70) / 3 = 76.67 -> 77
      // Difference: 73 - 77 = -4
      expect(result).toEqual({
        percentage: 0.73, // 73/100
        projectedDifference: -4, // 73 - 77
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles data with zero values', () => {
      const zeroData: IBankTimeForecast[] = [
        {
          model: 'Model1',
          projections: [
            { date: '2025-02-15', value: 0 },
            { date: '2025-03-15', value: 0 },
          ],
        },
      ];
      const result = calculateBankTimeMetrics(zeroData);
      expect(result).toEqual({
        percentage: 0,
        projectedDifference: 0,
      });
    });

    it('handles data with very large values', () => {
      const largeData: IBankTimeForecast[] = [
        {
          model: 'Model1',
          projections: [
            { date: '2025-02-15', value: 10000 },
            { date: '2025-03-15', value: 9999 },
          ],
        },
      ];
      const result = calculateBankTimeMetrics(largeData);
      expect(result).toEqual({
        percentage: 100, // 10000/100
        projectedDifference: 1, // 10000 - 9999
      });
    });

    it('handles data with negative values', () => {
      const negativeData: IBankTimeForecast[] = [
        {
          model: 'Model1',
          projections: [
            { date: '2025-02-15', value: -50 },
            { date: '2025-03-15', value: -30 },
          ],
        },
      ];
      const result = calculateBankTimeMetrics(negativeData);
      expect(result).toEqual({
        percentage: -0.5, // -50/100
        projectedDifference: -20, // -50 - (-30)
      });
    });
  });
});
