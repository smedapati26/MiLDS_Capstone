import { describe, expect, it } from 'vitest';

import { aircraftTransferDefaultValues, AircraftTransferFilterSchema, AircraftTransferFilterSchemaType } from '@features/equipment-transfer/Transfer/Aircraft/schema';

describe('AircraftTransferFilterSchema', () => {
  it('should validate a valid object', () => {
    const validData: AircraftTransferFilterSchemaType = {
      statuses: ['FMC', 'PMC', 'NMC'],
      models: ['ModelA', 'ModelB'],
    };

    expect(AircraftTransferFilterSchema.parse(validData)).toEqual(validData);
  });

  it('should validate an object with empty values', () => {
    const validData: AircraftTransferFilterSchemaType = {
      statuses: [],
      models: [],
    };

    expect(AircraftTransferFilterSchema.parse(validData)).toEqual(validData);
  });

  it('should validate the default values', () => {
    expect(AircraftTransferFilterSchema.parse(aircraftTransferDefaultValues)).toEqual(aircraftTransferDefaultValues);
  });

  it('should reject invalid OR Status type', () => {
    const invalidData = {
      statuses: 'DADE', // should be array for multiselect, not single string
      models: [],
    };

    expect(() => AircraftTransferFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid model type', () => {
    const invalidData = {
      statuses: [],
      models: 'ModelA', // should be array for multiselect, not single string
    };

    expect(() => AircraftTransferFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject missing required fields', () => {
    const invalidData = {
      // missing all fields
    };

    expect(() => AircraftTransferFilterSchema.parse(invalidData)).toThrow();
  });
});
