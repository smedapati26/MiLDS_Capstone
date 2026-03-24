/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import { ISurvivalPredictionDto } from '@store/griffin_api/components/models';

// Runtime type guard for ISurvivalPredictionDto
function isISurvivalPredictionDto(obj: any): obj is ISurvivalPredictionDto {
  if (typeof obj !== 'object' || obj === null) return false;

  const requiredStringProps = [
    'aircraft',
    'aircraft_model',
    'work_unit_code',
    'comp_serial_number',
    'part_number',
    'nomenclature',
  ];

  for (const prop of requiredStringProps) {
    if (typeof obj[prop] !== 'string') return false;
  }

  if (typeof obj.id !== 'number') return false;

  const horizonProps = [
    'horizon_5',
    'horizon_10',
    'horizon_15',
    'horizon_20',
    'horizon_25',
    'horizon_30',
    'horizon_35',
    'horizon_40',
    'horizon_45',
    'horizon_50',
    'horizon_55',
    'horizon_60',
    'horizon_65',
    'horizon_70',
    'horizon_75',
    'horizon_80',
    'horizon_85',
    'horizon_90',
    'horizon_95',
    'horizon_100',
  ];

  for (const prop of horizonProps) {
    if (typeof obj[prop] !== 'number') return false;
  }

  return true;
}

describe('isISurvivalPredictionDto', () => {
  it('should return true for a valid ISurvivalPredictionDto object', () => {
    const validObj = {
      id: 1,
      aircraft: 'AC123',
      aircraft_model: 'ModelX',
      work_unit_code: 'WUC456',
      comp_serial_number: 'SN789',
      part_number: 'PN101112',
      nomenclature: 'Nomenclature1',
      horizon_5: 0.95,
      horizon_10: 0.9,
      horizon_15: 0.85,
      horizon_20: 0.8,
      horizon_25: 0.75,
      horizon_30: 0.7,
      horizon_35: 0.65,
      horizon_40: 0.6,
      horizon_45: 0.55,
      horizon_50: 0.5,
      horizon_55: 0.45,
      horizon_60: 0.4,
      horizon_65: 0.35,
      horizon_70: 0.3,
      horizon_75: 0.25,
      horizon_80: 0.2,
      horizon_85: 0.15,
      horizon_90: 0.1,
      horizon_95: 0.05,
      horizon_100: 0.0,
    };

    expect(isISurvivalPredictionDto(validObj)).toBe(true);
  });

  it('should return false if any required string property is missing or not a string', () => {
    const invalidObj = {
      id: 1,
      aircraft: 123, // invalid type
      aircraft_model: 'ModelX',
      work_unit_code: 'WUC456',
      comp_serial_number: 'SN789',
      part_number: 'PN101112',
      nomenclature: 'Nomenclature1',
      horizon_5: 0.95,
      horizon_10: 0.9,
      horizon_15: 0.85,
      horizon_20: 0.8,
      horizon_25: 0.75,
      horizon_30: 0.7,
      horizon_35: 0.65,
      horizon_40: 0.6,
      horizon_45: 0.55,
      horizon_50: 0.5,
      horizon_55: 0.45,
      horizon_60: 0.4,
      horizon_65: 0.35,
      horizon_70: 0.3,
      horizon_75: 0.25,
      horizon_80: 0.2,
      horizon_85: 0.15,
      horizon_90: 0.1,
      horizon_95: 0.05,
      horizon_100: 0.0,
    };

    expect(isISurvivalPredictionDto(invalidObj)).toBe(false);
  });

  it('should return false if any horizon property is missing or not a number', () => {
    const invalidObj = {
      id: 1,
      aircraft: 'AC123',
      aircraft_model: 'ModelX',
      work_unit_code: 'WUC456',
      comp_serial_number: 'SN789',
      part_number: 'PN101112',
      nomenclature: 'Nomenclature1',
      horizon_5: 0.95,
      horizon_10: '0.9', // invalid type
      horizon_15: 0.85,
      horizon_20: 0.8,
      horizon_25: 0.75,
      horizon_30: 0.7,
      horizon_35: 0.65,
      horizon_40: 0.6,
      horizon_45: 0.55,
      horizon_50: 0.5,
      horizon_55: 0.45,
      horizon_60: 0.4,
      horizon_65: 0.35,
      horizon_70: 0.3,
      horizon_75: 0.25,
      horizon_80: 0.2,
      horizon_85: 0.15,
      horizon_90: 0.1,
      horizon_95: 0.05,
      horizon_100: 0.0,
    };

    expect(isISurvivalPredictionDto(invalidObj)).toBe(false);
  });

  it('should return false for null or non-object inputs', () => {
    expect(isISurvivalPredictionDto(null)).toBe(false);
    expect(isISurvivalPredictionDto(42)).toBe(false);
    expect(isISurvivalPredictionDto('string')).toBe(false);
  });
});
