import { describe, expect, it } from 'vitest';

import { Echelon } from '@ai2c/pmx-mui/models';

import { mapUnitsWithTaskforceHierarchy, taskforceTopLevelUnit } from '@utils/helpers/mapUnitsWithTaskforceHierarchy';

import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';

describe('mapUnitsWithTaskforceHierarchy', () => {
  it('should add the taskforceTopLevelUnit at the top', () => {
    const units: Array<IUnitBrief> = [];
    const result = mapUnitsWithTaskforceHierarchy(units);
    expect(result[0]).toEqual(taskforceTopLevelUnit);
  });

  it('should increment the level of taskforce units', () => {
    const units: Array<IUnitBrief> = [
      {
        uic: 'TF001',
        parentUic: undefined,
        echelon: Echelon.TASK_FORCE,
        component: 'TF',
        level: 1,
        displayName: 'Alpha Taskforce',
        shortName: 'Alpha',
        nickName: 'Alpha',
      },
      {
        uic: '001',
        parentUic: undefined,
        echelon: Echelon.BRIGADE,
        component: 'BG',
        level: 1,
        displayName: 'Bravo Brigade',
        shortName: 'Bravo',
        nickName: 'Bravo',
      },
    ];
    const result = mapUnitsWithTaskforceHierarchy(units);
    expect(result.find((unit) => unit.uic === 'TF001')?.level).toBe(2);
    expect(result.find((unit) => unit.uic === '001')?.level).toBe(1);
  });

  it('should set parentUic of taskforce units to TASK_FORCE_TOP_LEVEL_UIC if not already set', () => {
    const units: Array<IUnitBrief> = [
      {
        uic: 'TF001',
        parentUic: undefined,
        echelon: Echelon.TASK_FORCE,
        component: 'TF',
        level: 1,
        displayName: 'Alpha Taskforce',
        shortName: 'Alpha',
        nickName: 'Alpha',
      },
    ];
    const result = mapUnitsWithTaskforceHierarchy(units);
    expect(result.find((unit) => unit.uic === 'TF001')?.parentUic).toBe('taskforce_top_level_parent');
  });

  it('should not change parentUic of non-taskforce units', () => {
    const units: Array<IUnitBrief> = [
      {
        uic: '001',
        parentUic: '000',
        echelon: Echelon.BRIGADE,
        component: 'BG',
        level: 1,
        displayName: 'Bravo Brigade',
        shortName: 'Bravo',
        nickName: 'Bravo',
      },
    ];
    const result = mapUnitsWithTaskforceHierarchy(units);
    expect(result.find((unit) => unit.uic === '001')?.parentUic).toBe('000');
  });

  it('should sort units alphabetically by display name', () => {
    const units: Array<IUnitBrief> = [
      {
        uic: '002',
        parentUic: undefined,
        echelon: Echelon.BRIGADE,
        component: 'BG',
        level: 1,
        displayName: 'Charlie Brigade',
        shortName: 'Charlie',
        nickName: 'Charlie',
      },
      {
        uic: '001',
        parentUic: undefined,
        echelon: Echelon.BRIGADE,
        component: 'BG',
        level: 1,
        displayName: 'Bravo Brigade',
        shortName: 'Bravo',
        nickName: 'Bravo',
      },
    ];
    const result = mapUnitsWithTaskforceHierarchy(units);
    expect(result[0].displayName).toBe('Bravo Brigade');
    expect(result[1].displayName).toBe('Charlie Brigade');
  });
});
