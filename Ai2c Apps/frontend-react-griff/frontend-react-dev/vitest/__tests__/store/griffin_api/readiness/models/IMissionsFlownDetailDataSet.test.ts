import { describe, expect, it } from 'vitest';

import { IMissionsFlownDetailDataSet, MissionTypesEnum } from '@store/griffin_api/readiness/models';

describe('IMissionsFlownDetailDataSet', () => {
  const dto: IMissionsFlownDetailDataSet = {
    unit: 'TEST_UNIT',
    flight_id: '0123456789',
    mission_type: MissionTypesEnum.TRAINING,
    day_mission_hours: 10,
    night_mission_hours: 10,
    start_date: '2025-01-01',
    stop_date: '2025-12-01',
    day_mission_flag: true,
    night_mission_flag: true,
  };

  it('should have the correct interface structure', () => {
    expect(dto).toHaveProperty('unit');
    expect(dto).toHaveProperty('flight_id');
    expect(dto).toHaveProperty('mission_type');
    expect(dto).toHaveProperty('day_mission_hours');
    expect(dto).toHaveProperty('night_mission_hours');
    expect(dto).toHaveProperty('start_date');
    expect(dto).toHaveProperty('stop_date');
    expect(dto).toHaveProperty('day_mission_flag');
    expect(dto).toHaveProperty('night_mission_flag');
  });

  it('should accept valid data types', () => {
    expectTypeOf(dto.unit).toBeString();
    expectTypeOf(dto.flight_id).toBeString();
    expectTypeOf(dto.day_mission_hours).toBeNumber();
    expectTypeOf(dto.night_mission_hours).toBeNumber();
    expectTypeOf(dto.start_date).toBeString();
    expectTypeOf(dto.stop_date).toBeString();
    expectTypeOf(dto.day_mission_flag!).toBeBoolean();
    expectTypeOf(dto.night_mission_flag!).toBeBoolean();
  });
});
