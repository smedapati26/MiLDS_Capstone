import { describe, expect, it } from 'vitest';

import { IMissionsFlownDetailDataSet } from '../../../src/store/griffin_api/readiness/models/IMissionsFlownDetailDataSet';

describe('IMissionsFlownDetailDataSet', () => {
  it('should create an IMissionsFlownDetailDataSet object with correct properties', () => {
    const data: IMissionsFlownDetailDataSet = {
      unit: 'Unit A',
      flight_id: 'FL123',
      mission_type: 'Training',
      day_mission_hours: 5.5,
      night_mission_hours: 2.0,
      start_date: '2023-01-01',
      stop_date: '2023-01-01',
      day_mission_flag: true,
      night_mission_flag: false,
    };

    expect(data.unit).toBe('Unit A');
    expect(data.flight_id).toBe('FL123');
    expect(data.mission_type).toBe('Training');
    expect(data.day_mission_hours).toBe(5.5);
    expect(data.night_mission_hours).toBe(2.0);
    expect(data.start_date).toBe('2023-01-01');
    expect(data.stop_date).toBe('2023-01-01');
    expect(data.day_mission_flag).toBe(true);
    expect(data.night_mission_flag).toBe(false);
  });

  it('should have required properties as correct types', () => {
    const data: IMissionsFlownDetailDataSet = {
      unit: 'Unit B',
      flight_id: 'FL456',
      mission_type: 'Combat',
      day_mission_hours: 10,
      night_mission_hours: 5,
      start_date: '2023-02-01',
      stop_date: '2023-02-01',
    };

    expect(typeof data.unit).toBe('string');
    expect(typeof data.flight_id).toBe('string');
    expect(typeof data.mission_type).toBe('string');
    expect(typeof data.day_mission_hours).toBe('number');
    expect(typeof data.night_mission_hours).toBe('number');
    expect(typeof data.start_date).toBe('string');
    expect(typeof data.stop_date).toBe('string');
  });

  it('should handle optional flags as undefined when not provided', () => {
    const data: IMissionsFlownDetailDataSet = {
      unit: 'Unit C',
      flight_id: 'FL789',
      mission_type: 'Patrol',
      day_mission_hours: 8,
      night_mission_hours: 0,
      start_date: '2023-03-01',
      stop_date: '2023-03-01',
    };

    expect(data.day_mission_flag).toBeUndefined();
    expect(data.night_mission_flag).toBeUndefined();
  });

  it('should handle zero values for hours', () => {
    const data: IMissionsFlownDetailDataSet = {
      unit: 'Unit D',
      flight_id: 'FL000',
      mission_type: 'Maintenance',
      day_mission_hours: 0,
      night_mission_hours: 0,
      start_date: '2023-04-01',
      stop_date: '2023-04-01',
    };

    expect(data.day_mission_hours).toBe(0);
    expect(data.night_mission_hours).toBe(0);
  });
});
