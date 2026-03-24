/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import { IModelRiskFilters } from '@store/griffin_api/components/models';

// Runtime type guard for IModelRiskFilters
function isIModelRiskFilters(obj: any): obj is IModelRiskFilters {
  return typeof obj === 'object' && obj !== null && typeof obj.uic === 'string' && typeof obj.part_number === 'string';
}

describe('isIModelRiskFilters', () => {
  it('should return true for a valid IModelRiskFilters object', () => {
    const validObj = {
      uic: 'UIC123',
      part_number: 'PN456',
    };
    expect(isIModelRiskFilters(validObj)).toBe(true);
  });

  it('should return false if uic is missing', () => {
    const invalidObj = {
      part_number: 'PN456',
    };
    expect(isIModelRiskFilters(invalidObj)).toBe(false);
  });

  it('should return false if part_number is missing', () => {
    const invalidObj = {
      uic: 'UIC123',
    };
    expect(isIModelRiskFilters(invalidObj)).toBe(false);
  });

  it('should return false if uic is not a string', () => {
    const invalidObj = {
      uic: 123,
      part_number: 'PN456',
    };
    expect(isIModelRiskFilters(invalidObj)).toBe(false);
  });

  it('should return false if part_number is not a string', () => {
    const invalidObj = {
      uic: 'UIC123',
      part_number: 456,
    };
    expect(isIModelRiskFilters(invalidObj)).toBe(false);
  });

  it('should return false for null or non-object inputs', () => {
    expect(isIModelRiskFilters(null)).toBe(false);
    expect(isIModelRiskFilters(42)).toBe(false);
    expect(isIModelRiskFilters('string')).toBe(false);
  });
});
