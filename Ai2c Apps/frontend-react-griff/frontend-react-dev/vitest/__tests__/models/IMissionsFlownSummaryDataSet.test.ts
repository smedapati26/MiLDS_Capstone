import { describe, expect, it } from 'vitest';

import { IMissionsFlownSummaryDataSet } from '../../../src/store/griffin_api/readiness/models/IMissionsFlownSummaryDataSet';

describe('IMissionsFlownSummaryDataSet', () => {
  it('should create an IMissionsFlownSummaryDataSet object with correct properties', () => {
    const data: IMissionsFlownSummaryDataSet = {
      mission_type: 'Training',
      amount_flown: 10,
      hours_flown: 25.5,
    };

    expect(data.mission_type).toBe('Training');
    expect(data.amount_flown).toBe(10);
    expect(data.hours_flown).toBe(25.5);
  });

  it('should have mission_type as string, amount_flown and hours_flown as numbers', () => {
    const data: IMissionsFlownSummaryDataSet = {
      mission_type: 'Combat',
      amount_flown: 5,
      hours_flown: 12.0,
    };

    expect(typeof data.mission_type).toBe('string');
    expect(typeof data.amount_flown).toBe('number');
    expect(typeof data.hours_flown).toBe('number');
  });

  it('should handle zero values', () => {
    const data: IMissionsFlownSummaryDataSet = {
      mission_type: 'Patrol',
      amount_flown: 0,
      hours_flown: 0,
    };

    expect(data.amount_flown).toBe(0);
    expect(data.hours_flown).toBe(0);
  });
});
