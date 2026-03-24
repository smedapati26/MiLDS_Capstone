import { describe, expect, it } from 'vitest';

import { Echelon } from '@ai2c/pmx-mui';

import { IUnitBrief, IUnitBriefDto, mapToIUnitBrief } from '@store/amap_ai/units/models';

describe('mapToIUnitBrief', () => {
  it('should map IUnitBriefDto to IUnitBrief correctly', () => {
    const dto: IUnitBriefDto = {
      uic: '12345',
      echelon: Echelon.BATTALION,
      component: 'Component',
      level: 1,
      short_name: 'Short Name',
      display_name: 'Display Name',
      nick_name: 'Nick Name',
      state: 'State',
      parent_unit: 'Parent Unit',
    };

    const expected: IUnitBrief = {
      uic: '12345',
      echelon: Echelon.BATTALION,
      component: 'Component',
      level: 1,
      displayName: 'Display Name',
      shortName: 'Short Name',
      nickName: 'Nick Name',
      state: 'State',
      parentUic: 'Parent Unit',
    };

    const result = mapToIUnitBrief(dto);
    expect(result).toEqual(expected);
  });

  it('should handle null values in IUnitBriefDto', () => {
    const dto: IUnitBriefDto = {
      uic: '12345',
      echelon: Echelon.BATTALION,
      component: 'Component',
      level: 1,
      short_name: '',
      display_name: '',
      nick_name: null,
      state: null,
      parent_unit: null,
    };

    const expected: IUnitBrief = {
      uic: '12345',
      echelon: Echelon.BATTALION,
      component: 'Component',
      level: 1,
      displayName: '',
      shortName: '',
      nickName: undefined,
      state: undefined,
      parentUic: undefined,
    };

    const result = mapToIUnitBrief(dto);
    expect(result).toEqual(expected);
  });
});
