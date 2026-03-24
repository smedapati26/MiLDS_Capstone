import { describe, expect, it } from 'vitest';

import { IMissionsFlownSummaryDataSet, MissionTypesEnum } from '@store/griffin_api/readiness/models';

describe('IMissionsFlownSummaryDataSet', () => {
  const dto: IMissionsFlownSummaryDataSet = {
    mission_type: MissionTypesEnum.TRAINING,
    amount_flown: 10,
    hours_flown: 10,
  };

  it('should have the correct interface structure', () => {
    expect(dto).toHaveProperty('mission_type');
    expect(dto).toHaveProperty('amount_flown');
    expect(dto).toHaveProperty('hours_flown');
  });

  it('should accept valid data types', () => {
    expectTypeOf(dto.mission_type).toBeString();
    expectTypeOf(dto.amount_flown).toBeNumber();
    expectTypeOf(dto.hours_flown).toBeNumber();
  });
});
