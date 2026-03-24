/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import {
  getGraphColorByIndex,
  groupByFamilyAndSumDates,
} from '@features/flight-hour-program/overview/components/helper';

import { IFhpModelsProgress } from '@store/griffin_api/fhp/models';

describe('groupByFamilyAndSumDates', () => {
  it('groups by family and sums actualFlightHours for same date', () => {
    const input: IFhpModelsProgress[] = [
      {
        family: 'CHINOOK',
        model: 'CH-47F',
        dates: [
          { date: new Date('2025-01-01'), actualFlightHours: 10, projectedFlightHours: 0, predictedFlightHours: 0 },
          { date: new Date('2025-02-01'), actualFlightHours: 20, projectedFlightHours: 0, predictedFlightHours: 0 },
        ],
      },
      {
        family: 'CHINOOK',
        model: 'CH-47FM3',
        dates: [
          { date: new Date('2025-01-01'), actualFlightHours: 5, projectedFlightHours: 0, predictedFlightHours: 0 },
          { date: new Date('2025-03-01'), actualFlightHours: 15, projectedFlightHours: 0, predictedFlightHours: 0 },
        ],
      },
      {
        family: 'BLACK HAWK',
        model: 'HH-60M',
        dates: [
          { date: new Date('2025-01-01'), actualFlightHours: 7, projectedFlightHours: 0, predictedFlightHours: 0 },
        ],
      },
    ];

    const result = groupByFamilyAndSumDates(input);

    expect(result).toHaveLength(2);

    const chinook = result.find((f) => f.family === 'CHINOOK');
    expect(chinook).toBeDefined();
    expect(chinook!.dates).toHaveLength(3);
    expect(chinook!.dates[0].date).toEqual(new Date('2025-01-01'));
    expect(chinook!.dates[0].actualFlightHours).toBe(15); // 10 + 5

    const blackHawk = result.find((f) => f.family === 'BLACK HAWK');
    expect(blackHawk).toBeDefined();
    expect(blackHawk!.dates).toHaveLength(1);
    expect(blackHawk!.dates[0].actualFlightHours).toBe(7);
  });

  it('sorts dates in ascending order', () => {
    const input: IFhpModelsProgress[] = [
      {
        family: 'CHINOOK',
        model: 'CH-47F',
        dates: [
          { date: new Date('2025-03-01'), actualFlightHours: 10, projectedFlightHours: 0, predictedFlightHours: 0 },
          { date: new Date('2025-01-01'), actualFlightHours: 20, projectedFlightHours: 0, predictedFlightHours: 0 },
        ],
      },
    ];

    const result = groupByFamilyAndSumDates(input);
    expect(result[0].dates[0].date).toEqual(new Date('2025-01-01'));
    expect(result[0].dates[1].date).toEqual(new Date('2025-03-01'));
  });

  it('handles empty input', () => {
    expect(groupByFamilyAndSumDates([])).toEqual([]);
  });

  it('handles models with empty dates', () => {
    const input: IFhpModelsProgress[] = [{ family: 'CHINOOK', model: 'CH-47F', dates: [] }];
    const result = groupByFamilyAndSumDates(input);
    expect(result).toHaveLength(1);
    expect(result[0].dates).toEqual([]);
  });

  it('handles null or undefined date', () => {
    const input: IFhpModelsProgress[] = [
      {
        family: 'CHINOOK',
        model: 'CH-47F',
        dates: [
          { date: null, actualFlightHours: 10, projectedFlightHours: 0, predictedFlightHours: 0 },
          { date: undefined as any, actualFlightHours: 5, projectedFlightHours: 0, predictedFlightHours: 0 },
        ],
      },
    ];
    const result = groupByFamilyAndSumDates(input);
    expect(result[0].dates).toHaveLength(1);
    expect(result[0].dates[0].actualFlightHours).toBe(15); // 10 + 5
    expect(result[0].dates[0].date).toBeNull();
  });

  it('sums projectedFlightHours and predictedFlightHours for same date', () => {
    const input: IFhpModelsProgress[] = [
      {
        family: 'CHINOOK',
        model: 'CH-47F',
        dates: [
          { date: new Date('2025-01-01'), actualFlightHours: 1, projectedFlightHours: 2, predictedFlightHours: 3 },
        ],
      },
      {
        family: 'CHINOOK',
        model: 'CH-47FM3',
        dates: [
          { date: new Date('2025-01-01'), actualFlightHours: 4, projectedFlightHours: 5, predictedFlightHours: 6 },
        ],
      },
    ];
    const result = groupByFamilyAndSumDates(input);
    expect(result[0].dates[0].actualFlightHours).toBe(5); // 1 + 4
    expect(result[0].dates[0].projectedFlightHours).toBe(7); // 2 + 5
    expect(result[0].dates[0].predictedFlightHours).toBe(9); // 3 + 6
  });

  it('handles multiple families and multiple dates', () => {
    const input: IFhpModelsProgress[] = [
      {
        family: 'CHINOOK',
        model: 'CH-47F',
        dates: [
          { date: new Date('2025-01-01'), actualFlightHours: 1, projectedFlightHours: 2, predictedFlightHours: 3 },
          { date: new Date('2025-02-01'), actualFlightHours: 4, projectedFlightHours: 5, predictedFlightHours: 6 },
        ],
      },
      {
        family: 'BLACK HAWK',
        model: 'HH-60M',
        dates: [
          { date: new Date('2025-01-01'), actualFlightHours: 7, projectedFlightHours: 8, predictedFlightHours: 9 },
        ],
      },
    ];
    const result = groupByFamilyAndSumDates(input);
    expect(result).toHaveLength(2);
    const chinook = result.find((f) => f.family === 'CHINOOK');
    const blackHawk = result.find((f) => f.family === 'BLACK HAWK');
    expect(chinook!.dates).toHaveLength(2);
    expect(blackHawk!.dates).toHaveLength(1);
  });
});

describe('getGraphColorByIndex', () => {
  const mockTheme = {
    palette: {
      graph: {
        purple: '#a259ff',
        cyan: '#38bdf8',
        teal: '#00a6a1',
        pink: '#f472b6',
        green: '#22c55e',
        blue: '#2563eb',
        magenta: '#d946ef',
        yellow: '#eab308',
        teal2: '#2dd4bf',
        cyan2: '#67e8f9',
        orange: '#fb923c',
        purple2: '#c084fc',
      },
    },
  } as any;

  it('returns the correct color for a given index', () => {
    expect(getGraphColorByIndex(0, mockTheme)).toBe('#a259ff'); // purple
    expect(getGraphColorByIndex(1, mockTheme)).toBe('#38bdf8'); // cyan
    expect(getGraphColorByIndex(2, mockTheme)).toBe('#00a6a1'); // teal
  });

  it('wraps around if index is greater than colors length', () => {
    const colorCount = Object.keys(mockTheme.palette.graph).length;
    expect(getGraphColorByIndex(colorCount, mockTheme)).toBe('#a259ff'); // wraps to first
    expect(getGraphColorByIndex(colorCount + 1, mockTheme)).toBe('#38bdf8'); // wraps to second
  });
});
