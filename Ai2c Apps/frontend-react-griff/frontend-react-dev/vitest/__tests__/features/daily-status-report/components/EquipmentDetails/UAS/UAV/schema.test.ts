import { describe, expect, it } from 'vitest';

import {
  uavFilterDefaultValues,
  UAVFilterSchema,
} from '@features/daily-status-report/components/EquipmentDetails/UAS/UAV/schema';

describe('UAVFilterSchema', () => {
  it('should validate default values without throwing', () => {
    expect(() => UAVFilterSchema.parse(uavFilterDefaultValues)).not.toThrow();
  });

  it('should invalidate invalid data', () => {
    expect(() => UAVFilterSchema.parse({ status: 123 })).toThrow();
  });

  it('should validate a valid object', () => {
    const validData = {
      status: 'active',
      launchStatus: 'ready',
      packed: 'yes',
      serialNumbers: ['SN1', 'SN2'],
      models: ['ModelA'],
      units: ['Unit1'],
      location: ['Loc1'],
      isHoursFlownChecked: true,
      hoursFlown: [10, 20],
      isTotalAirframeHoursChecked: false,
      totalAirframeHours: [5, 15],
    };
    expect(() => UAVFilterSchema.parse(validData)).not.toThrow();
  });
});
