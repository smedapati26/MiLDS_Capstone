import { describe, expect, it } from 'vitest';

import { IMaintenancePersonnelCount } from '@store/amap_api/personnel/models/IMaintenancePersonnelCount';

describe('IMaintenancePersonnelCount interface shape', () => {
  it('should have mos and ml as strings and count as number', () => {
    const example: IMaintenancePersonnelCount = {
      mos: 'someMos',
      ml: 'someMl',
      count: 5,
    };

    expect(typeof example.mos).toBe('string');
    expect(typeof example.ml).toBe('string');
    expect(typeof example.count).toBe('number');
  });

  it('should fail if count is not a number', () => {
    const invalidExample: IMaintenancePersonnelCount = {
      mos: 'someMos',
      ml: 'someMl',
      // @ts-expect-error Testing invalid type
      count: 'five',
    };

    expect(typeof invalidExample.count).not.toBe('number');
  });
});
