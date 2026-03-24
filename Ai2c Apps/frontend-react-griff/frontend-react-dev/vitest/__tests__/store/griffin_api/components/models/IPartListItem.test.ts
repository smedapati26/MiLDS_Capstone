/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import { IPartListItem } from '@store/griffin_api/components/models';

// Runtime type guard for IPartListItem
function isIPartListItem(obj: any): obj is IPartListItem {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Array.isArray(obj.models) &&
    obj.models.every((model: any) => typeof model === 'string') &&
    typeof obj.part_number === 'string'
  );
}

describe('isIPartListItem', () => {
  it('should return true for a valid IPartListItem object', () => {
    const validObj = {
      models: ['ModelA', 'ModelB'],
      part_number: 'PN123',
    };
    expect(isIPartListItem(validObj)).toBe(true);
  });

  it('should return false if models is missing', () => {
    const invalidObj = {
      part_number: 'PN123',
    };
    expect(isIPartListItem(invalidObj)).toBe(false);
  });

  it('should return false if part_number is missing', () => {
    const invalidObj = {
      models: ['ModelA', 'ModelB'],
    };
    expect(isIPartListItem(invalidObj)).toBe(false);
  });

  it('should return false if models is not an array', () => {
    const invalidObj = {
      models: 'ModelA',
      part_number: 'PN123',
    };
    expect(isIPartListItem(invalidObj)).toBe(false);
  });

  it('should return false if models array contains non-string elements', () => {
    const invalidObj = {
      models: ['ModelA', 123],
      part_number: 'PN123',
    };
    expect(isIPartListItem(invalidObj)).toBe(false);
  });

  it('should return false if part_number is not a string', () => {
    const invalidObj = {
      models: ['ModelA', 'ModelB'],
      part_number: 123,
    };
    expect(isIPartListItem(invalidObj)).toBe(false);
  });

  it('should return false for null or non-object inputs', () => {
    expect(isIPartListItem(null)).toBe(false);
    expect(isIPartListItem(42)).toBe(false);
    expect(isIPartListItem('string')).toBe(false);
  });
});
