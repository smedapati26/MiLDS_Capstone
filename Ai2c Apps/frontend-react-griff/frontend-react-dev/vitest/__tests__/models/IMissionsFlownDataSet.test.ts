import { describe, expect, it } from 'vitest';

import { IMissionsFlownDataSet } from '../../../src/store/griffin_api/readiness/models/IMissionsFlownDataSet';

describe('IMissionsFlownDataSet', () => {
  it('should create an IMissionsFlownDataSet object with correct properties', () => {
    const data: IMissionsFlownDataSet = {
      mission_type: 'Training',
      day_mission_count: 10,
      night_mission_count: 5,
      day_mission_hours: 25.5,
      night_mission_hours: 12.0,
    };

    expect(data.mission_type).toBe('Training');
    expect(data.day_mission_count).toBe(10);
    expect(data.night_mission_count).toBe(5);
    expect(data.day_mission_hours).toBe(25.5);
    expect(data.night_mission_hours).toBe(12.0);
  });

  it('should have required properties as correct types', () => {
    const data: IMissionsFlownDataSet = {
      mission_type: 'Combat',
      day_mission_count: 8,
      night_mission_count: 3,
      day_mission_hours: 20.0,
      night_mission_hours: 10.5,
    };

    expect(typeof data.mission_type).toBe('string');
    expect(typeof data.day_mission_count).toBe('number');
    expect(typeof data.night_mission_count).toBe('number');
    expect(typeof data.day_mission_hours).toBe('number');
    expect(typeof data.night_mission_hours).toBe('number');
  });

  it('should handle optional weather properties when provided', () => {
    const data: IMissionsFlownDataSet = {
      mission_type: 'Patrol',
      day_mission_count: 15,
      night_mission_count: 7,
      day_mission_hours: 30.0,
      night_mission_hours: 15.0,
      weather_mission_count: 2,
      weather_mission_hours: 5.5,
    };

    expect(data.weather_mission_count).toBe(2);
    expect(data.weather_mission_hours).toBe(5.5);
    expect(typeof data.weather_mission_count).toBe('number');
    expect(typeof data.weather_mission_hours).toBe('number');
  });

  it('should handle optional weather properties as undefined when not provided', () => {
    const data: IMissionsFlownDataSet = {
      mission_type: 'Maintenance',
      day_mission_count: 0,
      night_mission_count: 0,
      day_mission_hours: 0,
      night_mission_hours: 0,
    };

    expect(data.weather_mission_count).toBeUndefined();
    expect(data.weather_mission_hours).toBeUndefined();
  });

  it('should handle zero values for counts and hours', () => {
    const data: IMissionsFlownDataSet = {
      mission_type: 'Test',
      day_mission_count: 0,
      night_mission_count: 0,
      day_mission_hours: 0,
      night_mission_hours: 0,
    };

    expect(data.day_mission_count).toBe(0);
    expect(data.night_mission_count).toBe(0);
    expect(data.day_mission_hours).toBe(0);
    expect(data.night_mission_hours).toBe(0);
  });
});
