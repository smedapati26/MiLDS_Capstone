/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import { ILongevity } from '@store/griffin_api/components/models';

// Runtime type guard for ILongevity
function isILongevity(obj: any): obj is ILongevity {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.tbo === 'number' &&
    (obj.value_type === 'tbo' || obj.value_type === 'maot') &&
    typeof obj.unit_average === 'number' &&
    typeof obj.fleet_average === 'number'
  );
}

describe('isILongevity', () => {
  it('should return true for a valid ILongevity object', () => {
    const validObj = {
      tbo: 1000,
      value_type: 'tbo',
      unit_average: 950,
      fleet_average: 900,
    };
    expect(isILongevity(validObj)).toBe(true);
  });

  it('should return false if tbo is not a number', () => {
    const invalidObj = {
      tbo: '1000',
      value_type: 'tbo',
      unit_average: 950,
      fleet_average: 900,
    };
    expect(isILongevity(invalidObj)).toBe(false);
  });

  it('should return false if value_type is invalid', () => {
    const invalidObj = {
      tbo: 1000,
      value_type: 'invalid',
      unit_average: 950,
      fleet_average: 900,
    };
    expect(isILongevity(invalidObj)).toBe(false);
  });

  it('should return false if unit_average is missing', () => {
    const invalidObj = {
      tbo: 1000,
      value_type: 'maot',
      fleet_average: 900,
    };
    expect(isILongevity(invalidObj)).toBe(false);
  });

  it('should return false if fleet_average is not a number', () => {
    const invalidObj = {
      tbo: 1000,
      value_type: 'maot',
      unit_average: 950,
      fleet_average: '900',
    };
    expect(isILongevity(invalidObj)).toBe(false);
  });
});
