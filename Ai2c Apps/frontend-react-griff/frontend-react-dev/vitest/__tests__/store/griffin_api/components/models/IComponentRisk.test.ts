/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import { IComponentRiskFilters, IComponentRiskPrediction, IFailureDetail } from '@store/griffin_api/components/models';

// Validator for IFailureDetail
function isFailureDetail(obj: any): obj is IFailureDetail {
  if (typeof obj !== 'object' || obj === null) return false;

  const keys = [
    // Upper bounds keys
    'failure_upper_0',
    'failure_upper_5',
    'failure_upper_10',
    'failure_upper_15',
    'failure_upper_20',
    'failure_upper_25',
    'failure_upper_30',
    'failure_upper_35',
    'failure_upper_40',
    'failure_upper_45',
    'failure_upper_50',
    'failure_upper_55',
    'failure_upper_60',
    'failure_upper_65',
    'failure_upper_70',
    'failure_upper_75',
    'failure_upper_80',
    'failure_upper_85',
    'failure_upper_90',
    'failure_upper_95',
    'failure_upper_100',

    // Lower bounds keys
    'failure_lower_0',
    'failure_lower_5',
    'failure_lower_10',
    'failure_lower_15',
    'failure_lower_20',
    'failure_lower_25',
    'failure_lower_30',
    'failure_lower_35',
    'failure_lower_40',
    'failure_lower_45',
    'failure_lower_50',
    'failure_lower_55',
    'failure_lower_60',
    'failure_lower_65',
    'failure_lower_70',
    'failure_lower_75',
    'failure_lower_80',
    'failure_lower_85',
    'failure_lower_90',
    'failure_lower_95',
    'failure_lower_100',

    // Probability values keys
    'failure_prob_0',
    'failure_prob_5',
    'failure_prob_10',
    'failure_prob_15',
    'failure_prob_20',
    'failure_prob_25',
    'failure_prob_30',
    'failure_prob_35',
    'failure_prob_40',
    'failure_prob_45',
    'failure_prob_50',
    'failure_prob_55',
    'failure_prob_60',
    'failure_prob_65',
    'failure_prob_70',
    'failure_prob_75',
    'failure_prob_80',
    'failure_prob_85',
    'failure_prob_90',
    'failure_prob_95',
    'failure_prob_100',
  ];

  return keys.every((key) => typeof obj[key] === 'number');
}

// Validator for IComponentRiskPrediction
function isComponentRiskPrediction(obj: any): obj is IComponentRiskPrediction {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.serial_number === 'string' &&
    typeof obj.part_number === 'string' &&
    typeof obj.nomenclature === 'string' &&
    isFailureDetail(obj.failure_detail)
  );
}

// Validator for IComponentRiskFilters
function isComponentRiskFilters(obj: any): obj is IComponentRiskFilters {
  if (typeof obj !== 'object' || obj === null) return false;
  if (typeof obj.uic !== 'string') return false;

  if (obj.variant !== undefined && obj.variant !== 'top' && obj.variant !== 'bottom') return false;

  if (
    obj.serial_numbers !== undefined &&
    (!Array.isArray(obj.serial_numbers) || !obj.serial_numbers.every((s: string) => typeof s === 'string'))
  )
    return false;

  if (
    obj.part_numbers !== undefined &&
    (!Array.isArray(obj.part_numbers) || !obj.part_numbers.every((s: string) => typeof s === 'string'))
  )
    return false;

  if (
    obj.other_uics !== undefined &&
    (!Array.isArray(obj.other_uics) || !obj.other_uics.every((s: string) => typeof s === 'string'))
  )
    return false;

  if (obj.serial !== undefined && typeof obj.serial !== 'string') return false;

  return true;
}

describe('Validators for interfaces', () => {
  it('should validate a correct IFailureDetail object', () => {
    const failureDetail: IFailureDetail = {
      failure_upper_0: 0,
      failure_upper_5: 5,
      failure_upper_10: 10,
      failure_upper_15: 15,
      failure_upper_20: 20,
      failure_upper_25: 25,
      failure_upper_30: 30,
      failure_upper_35: 35,
      failure_upper_40: 40,
      failure_upper_45: 45,
      failure_upper_50: 50,
      failure_upper_55: 55,
      failure_upper_60: 60,
      failure_upper_65: 65,
      failure_upper_70: 70,
      failure_upper_75: 75,
      failure_upper_80: 80,
      failure_upper_85: 85,
      failure_upper_90: 90,
      failure_upper_95: 95,
      failure_upper_100: 100,

      failure_lower_0: 0,
      failure_lower_5: 1,
      failure_lower_10: 2,
      failure_lower_15: 3,
      failure_lower_20: 4,
      failure_lower_25: 5,
      failure_lower_30: 6,
      failure_lower_35: 7,
      failure_lower_40: 8,
      failure_lower_45: 9,
      failure_lower_50: 10,
      failure_lower_55: 11,
      failure_lower_60: 12,
      failure_lower_65: 13,
      failure_lower_70: 14,
      failure_lower_75: 15,
      failure_lower_80: 16,
      failure_lower_85: 17,
      failure_lower_90: 18,
      failure_lower_95: 19,
      failure_lower_100: 20,

      failure_prob_0: 0.0,
      failure_prob_5: 0.05,
      failure_prob_10: 0.1,
      failure_prob_15: 0.15,
      failure_prob_20: 0.2,
      failure_prob_25: 0.25,
      failure_prob_30: 0.3,
      failure_prob_35: 0.35,
      failure_prob_40: 0.4,
      failure_prob_45: 0.45,
      failure_prob_50: 0.5,
      failure_prob_55: 0.55,
      failure_prob_60: 0.6,
      failure_prob_65: 0.65,
      failure_prob_70: 0.7,
      failure_prob_75: 0.75,
      failure_prob_80: 0.8,
      failure_prob_85: 0.85,
      failure_prob_90: 0.9,
      failure_prob_95: 0.95,
      failure_prob_100: 1.0,
    };

    expect(isFailureDetail(failureDetail)).toBe(true);
  });

  it('should invalidate an incorrect IFailureDetail object', () => {
    const invalidFailureDetail = {
      failure_upper_0: 0,
      failure_upper_5: '5', // invalid type
      failure_lower_0: 0,
      failure_prob_0: 0.0,
    };

    expect(isFailureDetail(invalidFailureDetail)).toBe(false);
  });

  it('should validate a correct IComponentRiskPrediction object', () => {
    const validPrediction: IComponentRiskPrediction = {
      serial_number: 'SN123',
      part_number: 'PN456',
      nomenclature: 'Nomenclature',
      failure_detail: {
        failure_upper_0: 0,
        failure_upper_5: 5,
        failure_upper_10: 10,
        failure_upper_15: 15,
        failure_upper_20: 20,
        failure_upper_25: 25,
        failure_upper_30: 30,
        failure_upper_35: 35,
        failure_upper_40: 40,
        failure_upper_45: 45,
        failure_upper_50: 50,
        failure_upper_55: 55,
        failure_upper_60: 60,
        failure_upper_65: 65,
        failure_upper_70: 70,
        failure_upper_75: 75,
        failure_upper_80: 80,
        failure_upper_85: 85,
        failure_upper_90: 90,
        failure_upper_95: 95,
        failure_upper_100: 100,

        failure_lower_0: 0,
        failure_lower_5: 1,
        failure_lower_10: 2,
        failure_lower_15: 3,
        failure_lower_20: 4,
        failure_lower_25: 5,
        failure_lower_30: 6,
        failure_lower_35: 7,
        failure_lower_40: 8,
        failure_lower_45: 9,
        failure_lower_50: 10,
        failure_lower_55: 11,
        failure_lower_60: 12,
        failure_lower_65: 13,
        failure_lower_70: 14,
        failure_lower_75: 15,
        failure_lower_80: 16,
        failure_lower_85: 17,
        failure_lower_90: 18,
        failure_lower_95: 19,
        failure_lower_100: 20,

        failure_prob_0: 0.0,
        failure_prob_5: 0.05,
        failure_prob_10: 0.1,
        failure_prob_15: 0.15,
        failure_prob_20: 0.2,
        failure_prob_25: 0.25,
        failure_prob_30: 0.3,
        failure_prob_35: 0.35,
        failure_prob_40: 0.4,
        failure_prob_45: 0.45,
        failure_prob_50: 0.5,
        failure_prob_55: 0.55,
        failure_prob_60: 0.6,
        failure_prob_65: 0.65,
        failure_prob_70: 0.7,
        failure_prob_75: 0.75,
        failure_prob_80: 0.8,
        failure_prob_85: 0.85,
        failure_prob_90: 0.9,
        failure_prob_95: 0.95,
        failure_prob_100: 1.0,
      },
    };

    expect(isComponentRiskPrediction(validPrediction)).toBe(true);
  });

  it('should invalidate an incorrect IComponentRiskPrediction object', () => {
    const invalidPrediction = {
      serial_number: 'SN123',
      part_number: 'PN456',
      nomenclature: 'Nomenclature',
      failure_detail: {
        failure_upper_0: 0,
        failure_upper_5: '5', // invalid type
      },
    };

    expect(isComponentRiskPrediction(invalidPrediction)).toBe(false);
  });

  it('should validate a correct IComponentRiskFilters object', () => {
    const validFilters: IComponentRiskFilters = {
      uic: 'UIC123',
      variant: 'top',
      serial_numbers: ['SN1', 'SN2'],
      part_numbers: ['PN1'],
      other_uics: ['UIC1'],
      serial: 'SN123',
    };

    expect(isComponentRiskFilters(validFilters)).toBe(true);
  });

  it('should invalidate an incorrect IComponentRiskFilters object', () => {
    const invalidFilters = {
      uic: 'UIC123',
      variant: 'middle', // invalid variant
      serial_numbers: ['SN1', 2], // invalid serial number type
    };

    expect(isComponentRiskFilters(invalidFilters)).toBe(false);
  });
});
