import { describe, expect, it } from 'vitest';

import { IMissionsFlownDataSet, MissionTypesEnum } from '@store/griffin_api/readiness/models';

describe('IMissionsFlownDataSet', () => {
  const dto: IMissionsFlownDataSet = {
    mission_type: MissionTypesEnum.TRAINING,
    day_mission_count: 10,
    night_mission_count: 10,
    day_mission_hours: 10,
    night_mission_hours: 10,
    weather_mission_count: 10,
    weather_mission_hours: 10,
  };

  it('should have the correct interface structure', () => {
    expect(dto).toHaveProperty('mission_type');
    expect(dto).toHaveProperty('day_mission_count');
    expect(dto).toHaveProperty('night_mission_count');
    expect(dto).toHaveProperty('day_mission_hours');
    expect(dto).toHaveProperty('night_mission_hours');
    expect(dto).toHaveProperty('weather_mission_count');
    expect(dto).toHaveProperty('weather_mission_hours');
  });

  it('should accept valid data types', () => {
    expectTypeOf(dto.mission_type).toBeString();
    expectTypeOf(dto.day_mission_count).toBeNumber();
    expectTypeOf(dto.night_mission_count).toBeNumber();
    expectTypeOf(dto.day_mission_hours).toBeNumber();
    expectTypeOf(dto.night_mission_hours).toBeNumber();
    expectTypeOf(dto.weather_mission_count!).toBeNumber();
    expectTypeOf(dto.weather_mission_hours!).toBeNumber();
  });
});
