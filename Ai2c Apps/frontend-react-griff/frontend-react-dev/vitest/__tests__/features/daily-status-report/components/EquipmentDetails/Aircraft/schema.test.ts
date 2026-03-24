import { describe, expect, it } from 'vitest';

import {
  aircraftDefaultValues,
  AircraftFilterSchema,
  type AircraftFilterSchemaType,
} from '@features/daily-status-report/components/EquipmentDetails/Aircraft/schema';

describe('AircraftFilterSchema', () => {
  it('should validate a valid object', () => {
    const validData: AircraftFilterSchemaType = {
      launchStatus: 'ready',
      orStatus: 'operational',
      serialNumbers: ['SN001', 'SN002'],
      models: ['ModelA', 'ModelB'],
      units: ['Unit1', 'Unit2'],
      location: ['LocationA', 'LocationB'],
      modifications: ['Mod1', 'Mod2'],
      isHoursFlownChecked: true,
      hoursFlown: [100, 200],
      isHoursToPhaseChecked: false,
      hoursToPhase: [50, 150],
    };

    expect(AircraftFilterSchema.parse(validData)).toEqual(validData);
  });

  it('should validate an object with null statuses', () => {
    const validData: AircraftFilterSchemaType = {
      launchStatus: null,
      orStatus: null,
      serialNumbers: [],
      models: [],
      units: [],
      location: [],
      modifications: [],
      isHoursFlownChecked: false,
      hoursFlown: [0, 0],
      isHoursToPhaseChecked: false,
      hoursToPhase: [0, 0],
    };

    expect(AircraftFilterSchema.parse(validData)).toEqual(validData);
  });

  it('should validate the default values', () => {
    expect(AircraftFilterSchema.parse(aircraftDefaultValues)).toEqual(aircraftDefaultValues);
  });

  it('should reject invalid launchStatus type', () => {
    const invalidData = {
      launchStatus: 123, // should be string or null
      orStatus: null,
      serialNumbers: [],
      models: [],
      units: [],
      location: [],
      modifications: [],
      isHoursFlownChecked: false,
      hoursFlown: [0, 0],
      isHoursToPhaseChecked: false,
      hoursToPhase: [0, 0],
    };

    expect(() => AircraftFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid orStatus type', () => {
    const invalidData = {
      launchStatus: null,
      orStatus: {}, // should be string or null
      serialNumbers: [],
      models: [],
      units: [],
      location: [],
      modifications: [],
      isHoursFlownChecked: false,
      hoursFlown: [0, 0],
      isHoursToPhaseChecked: false,
      hoursToPhase: [0, 0],
    };

    expect(() => AircraftFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid serialNumbers type', () => {
    const invalidData = {
      launchStatus: null,
      orStatus: null,
      serialNumbers: 'not an array', // should be array of strings
      models: [],
      units: [],
      location: [],
      modifications: [],
      isHoursFlownChecked: false,
      hoursFlown: [0, 0],
      isHoursToPhaseChecked: false,
      hoursToPhase: [0, 0],
    };

    expect(() => AircraftFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid models type', () => {
    const invalidData = {
      launchStatus: null,
      orStatus: null,
      serialNumbers: [],
      models: [123, 456], // should be array of strings
      units: [],
      location: [],
      modifications: [],
      isHoursFlownChecked: false,
      hoursFlown: [0, 0],
      isHoursToPhaseChecked: false,
      hoursToPhase: [0, 0],
    };

    expect(() => AircraftFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid units type', () => {
    const invalidData = {
      launchStatus: null,
      orStatus: null,
      serialNumbers: [],
      models: [],
      units: ['valid', null], // should be array of strings, null not allowed
      location: [],
      modifications: [],
      isHoursFlownChecked: false,
      hoursFlown: [0, 0],
      isHoursToPhaseChecked: false,
      hoursToPhase: [0, 0],
    };

    expect(() => AircraftFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid location type', () => {
    const invalidData = {
      launchStatus: null,
      orStatus: null,
      serialNumbers: [],
      models: [],
      units: [],
      location: {}, // should be array of strings
      modifications: [],
      isHoursFlownChecked: false,
      hoursFlown: [0, 0],
      isHoursToPhaseChecked: false,
      hoursToPhase: [0, 0],
    };

    expect(() => AircraftFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid modifications type', () => {
    const invalidData = {
      launchStatus: null,
      orStatus: null,
      serialNumbers: [],
      models: [],
      units: [],
      location: [],
      modifications: [true, false], // should be array of strings
      isHoursFlownChecked: false,
      hoursFlown: [0, 0],
      isHoursToPhaseChecked: false,
      hoursToPhase: [0, 0],
    };

    expect(() => AircraftFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid isHoursFlownChecked type', () => {
    const invalidData = {
      launchStatus: null,
      orStatus: null,
      serialNumbers: [],
      models: [],
      units: [],
      location: [],
      modifications: [],
      isHoursFlownChecked: 'true', // should be boolean
      hoursFlown: [0, 0],
      isHoursToPhaseChecked: false,
      hoursToPhase: [0, 0],
    };

    expect(() => AircraftFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid hoursFlown type', () => {
    const invalidData = {
      launchStatus: null,
      orStatus: null,
      serialNumbers: [],
      models: [],
      units: [],
      location: [],
      modifications: [],
      isHoursFlownChecked: false,
      hoursFlown: 'not an array', // should be tuple of numbers
      isHoursToPhaseChecked: false,
      hoursToPhase: [0, 0],
    };

    expect(() => AircraftFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid hoursFlown length', () => {
    const invalidData = {
      launchStatus: null,
      orStatus: null,
      serialNumbers: [],
      models: [],
      units: [],
      location: [],
      modifications: [],
      isHoursFlownChecked: false,
      hoursFlown: [0], // should be exactly 2 numbers
      isHoursToPhaseChecked: false,
      hoursToPhase: [0, 0],
    };

    expect(() => AircraftFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid hoursFlown element type', () => {
    const invalidData = {
      launchStatus: null,
      orStatus: null,
      serialNumbers: [],
      models: [],
      units: [],
      location: [],
      modifications: [],
      isHoursFlownChecked: false,
      hoursFlown: [0, '200'], // should be numbers
      isHoursToPhaseChecked: false,
      hoursToPhase: [0, 0],
    };

    expect(() => AircraftFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid isHoursToPhaseChecked type', () => {
    const invalidData = {
      launchStatus: null,
      orStatus: null,
      serialNumbers: [],
      models: [],
      units: [],
      location: [],
      modifications: [],
      isHoursFlownChecked: false,
      hoursFlown: [0, 0],
      isHoursToPhaseChecked: null, // should be boolean
      hoursToPhase: [0, 0],
    };

    expect(() => AircraftFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject invalid hoursToPhase type', () => {
    const invalidData = {
      launchStatus: null,
      orStatus: null,
      serialNumbers: [],
      models: [],
      units: [],
      location: [],
      modifications: [],
      isHoursFlownChecked: false,
      hoursFlown: [0, 0],
      isHoursToPhaseChecked: false,
      hoursToPhase: [0, 0, 0], // should be exactly 2 numbers
    };

    expect(() => AircraftFilterSchema.parse(invalidData)).toThrow();
  });

  it('should reject missing required fields', () => {
    const invalidData = {
      // missing all fields
    };

    expect(() => AircraftFilterSchema.parse(invalidData)).toThrow();
  });
});
