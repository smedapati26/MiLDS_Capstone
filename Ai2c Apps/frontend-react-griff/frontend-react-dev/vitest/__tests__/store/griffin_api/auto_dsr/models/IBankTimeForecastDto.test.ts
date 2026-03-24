import { describe, expect, it } from 'vitest';

import { IBankTimeForecastDto } from '@store/griffin_api/auto_dsr/models';

// Runtime type guard for IBankTimeForecastDto
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isIBankTimeForecastDto(obj: any): obj is IBankTimeForecastDto {
  if (typeof obj !== 'object' || obj === null) return false;

  for (const aircraftModel in obj) {
    const dateMap = obj[aircraftModel];
    if (typeof dateMap !== 'object' || dateMap === null) return false;

    for (const date in dateMap) {
      if (typeof dateMap[date] !== 'number') return false;
    }
  }

  return true;
}

describe('isIBankTimeForecastDto', () => {
  it('should return true for a valid IBankTimeForecastDto object', () => {
    const validObj = {
      ModelX: {
        '2023-01-01': 100,
        '2023-01-02': 150,
      },
      ModelY: {
        '2023-01-01': 200,
      },
    };

    expect(isIBankTimeForecastDto(validObj)).toBe(true);
  });

  it('should return false if any nested value is not a number', () => {
    const invalidObj = {
      ModelX: {
        '2023-01-01': 100,
        '2023-01-02': '150', // invalid type
      },
    };

    expect(isIBankTimeForecastDto(invalidObj)).toBe(false);
  });

  it('should return false if any nested value is not an object', () => {
    const invalidObj = {
      ModelX: 123, // invalid type
    };

    expect(isIBankTimeForecastDto(invalidObj)).toBe(false);
  });

  it('should return false for null or non-object inputs', () => {
    expect(isIBankTimeForecastDto(null)).toBe(false);
    expect(isIBankTimeForecastDto(42)).toBe(false);
    expect(isIBankTimeForecastDto('string')).toBe(false);
  });

  it('should return true for an empty object', () => {
    expect(isIBankTimeForecastDto({})).toBe(true);
  });
});
