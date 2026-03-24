import { describe, expect, it } from 'vitest';

import { Echelon } from '@ai2c/pmx-mui/models';

import { filterUnitsHierarchy } from '@utils/helpers/filterUnitsHierarchy';

import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';

const alphaUnits: IUnitBrief[] = [
  {
    uic: '001A',
    parentUic: 'TEST',
    echelon: Echelon.BRIGADE,
    component: 'BG',
    level: 1,
    displayName: 'Alpha Brigade',
    shortName: 'Alpha',
    nickName: 'Alpha',
  },
  {
    uic: '002A',
    parentUic: '001A',
    echelon: Echelon.BATTALION,
    component: 'BAT',
    level: 2,
    displayName: 'Alpha Battalion',
    shortName: 'Alpha',
    nickName: 'Alpha',
  },
];

const bravoUnits: IUnitBrief[] = [
  {
    uic: '001B',
    parentUic: 'TEST',
    echelon: Echelon.BRIGADE,
    component: 'BG',
    level: 1,
    displayName: 'Bravo Brigade',
    shortName: 'Bravo',
    nickName: 'Bravo',
  },
  {
    uic: '002B',
    parentUic: '001B',
    echelon: Echelon.BATTALION,
    component: 'BAT',
    level: 2,
    displayName: 'Bravo Battalion',
    shortName: 'Bravo',
    nickName: 'Bravo',
  },
];

const units: IUnitBrief[] = [
  {
    uic: 'TEST',
    echelon: Echelon.CORPS,
    component: 'ARMY',
    level: 0,
    shortName: 'Test Short Name',
    displayName: 'Test Display Name',
    nickName: 'Test Nick Name',
    state: 'AZ',
    parentUic: undefined,
  },
  ...alphaUnits,
  ...bravoUnits,
];

describe('filterUnitsHierarchy', () => {
  it('should add the root unit at the top', () => {
    const result = filterUnitsHierarchy(units, [alphaUnits[0]]);
    expect(result[0].level).toEqual(0);
  });

  it('should only include ancestors and descendants of filtered units', () => {
    const result = filterUnitsHierarchy(units, [alphaUnits[0]]);

    expect(result.find((unit) => unit.uic === 'TEST'));
    expect(result.find((unit) => unit.uic === '001A'));
    expect(result.find((unit) => unit.uic === '002A'));
    
    expect(!result.find((unit) => unit.uic === '001B'));
    expect(!result.find((unit) => unit.uic === '002B'));
  });

  it('should still be in unit hierarchy order', () => {
    const result = filterUnitsHierarchy(units, [alphaUnits[0]]);

    expect(result[0].uic).toEqual('TEST');
    expect(result[1].uic).toEqual('001A');
    expect(result[2].uic).toEqual('002A');

    expect(result[0].level).toEqual(0);
    expect(result[1].level).toEqual(1);
    expect(result[2].level).toEqual(2);
  });
});
