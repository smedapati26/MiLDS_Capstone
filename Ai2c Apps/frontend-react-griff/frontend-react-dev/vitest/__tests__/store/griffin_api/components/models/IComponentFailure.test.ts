/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import { IComponentFailurePredictionsParams } from '@store/griffin_api/components/models';

// Runtime validator function
function isComponentFailurePredictionsParams(obj: any): obj is IComponentFailurePredictionsParams {
  if (typeof obj !== 'object' || obj === null) return false;
  if (!Array.isArray(obj.aircraft) || !obj.aircraft.every((a: string) => typeof a === 'string')) return false;
  if (typeof obj.horizon !== 'number') return false;
  if (obj.limit !== undefined && typeof obj.limit !== 'number') return false;
  if (obj.offset !== undefined && typeof obj.offset !== 'number') return false;
  return true;
}

describe('isComponentFailurePredictionsParams', () => {
  it('should return true for valid params with required fields', () => {
    const params = {
      aircraft: ['A1', 'B2'],
      horizon: 10,
    };
    expect(isComponentFailurePredictionsParams(params)).toBe(true);
  });

  it('should return true for valid params with optional fields', () => {
    const params = {
      aircraft: ['A1'],
      horizon: 5,
      limit: 100,
      offset: 10,
    };
    expect(isComponentFailurePredictionsParams(params)).toBe(true);
  });

  it('should return false if aircraft is not an array of strings', () => {
    const params = {
      aircraft: [1, 2, 3],
      horizon: 10,
    };
    expect(isComponentFailurePredictionsParams(params)).toBe(false);
  });

  it('should return false if horizon is not a number', () => {
    const params = {
      aircraft: ['A1'],
      horizon: '10',
    };
    expect(isComponentFailurePredictionsParams(params)).toBe(false);
  });

  it('should return false if limit or offset are not numbers when defined', () => {
    expect(
      isComponentFailurePredictionsParams({
        aircraft: ['A1'],
        horizon: 10,
        limit: '100',
      }),
    ).toBe(false);

    expect(
      isComponentFailurePredictionsParams({
        aircraft: ['A1'],
        horizon: 10,
        offset: '0',
      }),
    ).toBe(false);
  });

  it('should return false for null or non-object inputs', () => {
    expect(isComponentFailurePredictionsParams(null)).toBe(false);
    expect(isComponentFailurePredictionsParams(42)).toBe(false);
    expect(isComponentFailurePredictionsParams('string')).toBe(false);
  });
});
