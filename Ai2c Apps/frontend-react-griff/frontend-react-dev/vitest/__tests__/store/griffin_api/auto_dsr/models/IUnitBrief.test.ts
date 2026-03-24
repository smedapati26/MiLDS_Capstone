import { describe, expect, it } from 'vitest';

import { Echelon } from '@ai2c/pmx-mui/models';

import { IUnitBriefDto, mapToIUnitBrief } from '@store/griffin_api/auto_dsr/models';

describe('mapToIUnitBrief', () => {
  it('should map IUnitBriefDto to IUnitBrief correctly with all fields', () => {
    const dto: IUnitBriefDto = {
      uic: '12345',
      short_name: 'Unit A',
      display_name: 'Unit Alpha',
      nick_name: 'Alpha',
      echelon: Echelon.COMPANY,
      level: 1,
      component: 'Army',
      state: 'Active',
      parent_uic: '67890',
    };

    const result = mapToIUnitBrief(dto);

    expect(result.uic).toBe('12345');
    expect(result.echelon).toBe(Echelon.COMPANY);
    expect(result.component).toBe('Army');
    expect(result.level).toBe(1);
    expect(result.displayName).toBe('Unit Alpha');
    expect(result.shortName).toBe('Unit A');
    expect(result.nickName).toBe('Alpha');
    expect(result.state).toBe('Active');
    expect(result.parentUic).toBe('67890');
  });

  it('should map IUnitBriefDto to IUnitBrief correctly with null optional fields', () => {
    const dto: IUnitBriefDto = {
      uic: '54321',
      short_name: 'Unit B',
      display_name: 'Unit Beta',
      nick_name: null,
      echelon: Echelon.BATTALION,
      level: 2,
      component: 'Navy',
      state: null,
      parent_uic: null,
    };

    const result = mapToIUnitBrief(dto);

    expect(result.uic).toBe('54321');
    expect(result.echelon).toBe(Echelon.BATTALION);
    expect(result.component).toBe('Navy');
    expect(result.level).toBe(2);
    expect(result.displayName).toBe('Unit Beta');
    expect(result.shortName).toBe('Unit B');
    expect(result.nickName).toBeUndefined();
    expect(result.state).toBeUndefined();
    expect(result.parentUic).toBeUndefined();
  });
});
