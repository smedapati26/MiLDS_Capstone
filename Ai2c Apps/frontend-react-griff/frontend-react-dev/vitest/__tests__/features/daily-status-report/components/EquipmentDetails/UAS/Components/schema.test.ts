import { describe, expect, it } from 'vitest';

import {
  uacFilterDefaultValues,
  UACFilterSchema,
} from '@features/daily-status-report/components/EquipmentDetails/UAS/Components/schema';

describe('UACFilterSchema', () => {
  it('should validate default values without throwing', () => {
    expect(() => UACFilterSchema.parse(uacFilterDefaultValues)).not.toThrow();
  });

  it('should invalidate invalid data', () => {
    expect(() => UACFilterSchema.parse({ status: 123 })).toThrow();
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
    };
    expect(() => UACFilterSchema.parse(validData)).not.toThrow();
  });
});
