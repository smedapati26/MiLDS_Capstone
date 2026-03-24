import { describe, expect, it } from 'vitest';

import {
  agseDefaultValues,
  AgseFilterSchema,
  type AgseFilterSchemaType,
} from '@features/daily-status-report/components/EquipmentDetails/AGSE/schema';

describe('AgseFilterSchema', () => {
  it('should validate a valid object', () => {
    const validData: AgseFilterSchemaType = {
      conditions: 'active',
      serialNumbers: ['SN001', 'SN002'],
      models: ['ModelA', 'ModelB'],
      units: ['Unit1', 'Unit2'],
      location: ['LocationA', 'LocationB'],
    };

    expect(AgseFilterSchema.parse(validData)).toEqual(validData);
  });

  it('should validate an object with null conditions', () => {
    const validData: AgseFilterSchemaType = {
      conditions: null,
      serialNumbers: [],
      models: [],
      units: [],
      location: [],
    };

    expect(AgseFilterSchema.parse(validData)).toEqual(validData);
  });

  it('should validate the default values', () => {
    expect(AgseFilterSchema.parse(agseDefaultValues)).toEqual(agseDefaultValues);
  });

  it('should reject invalid status type', () => {
    const invalidData = {
      status: 123, // should be string or null
      serialNumbers: [],
      models: [],
      units: [],
      location: [],
    };

    expect(() => AgseFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid serialNumbers type', () => {
    const invalidData = {
      status: null,
      serialNumbers: 'not an array', // should be array of strings
      models: [],
      units: [],
      location: [],
    };

    expect(() => AgseFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid models type', () => {
    const invalidData = {
      status: null,
      serialNumbers: [],
      models: [123, 456], // should be array of strings
      units: [],
      location: [],
    };

    expect(() => AgseFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid units type', () => {
    const invalidData = {
      status: null,
      serialNumbers: [],
      models: [],
      units: ['valid', null], // should be array of strings, null not allowed
      location: [],
    };

    expect(() => AgseFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid location type', () => {
    const invalidData = {
      status: null,
      serialNumbers: [],
      models: [],
      units: [],
      location: {}, // should be array of strings
    };

    expect(() => AgseFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject missing required fields', () => {
    const invalidData = {
      // missing all fields
    };

    expect(() => AgseFilterSchema.parse(invalidData)).toThrow();
  });
});
