import { Echelon } from '@ai2c/pmx-mui/models';

import { IUnitBrief, IUnitBriefDto } from '@store/griffin_api/auto_dsr/models';

export const mockTestUic = 'TEST_UIC';

// Fake Unit from API
export const mockTestUnitDto: IUnitBriefDto = {
  uic: mockTestUic,
  echelon: Echelon.CORPS,
  component: 'ARMY',
  level: 0,
  short_name: 'Test Short Name',
  display_name: 'Test Display Name',
  nick_name: 'Test Nick Name',
  state: 'AZ',
  parent_uic: 'PARENT_TEST_UIC',
};

export const mockTestUnit: IUnitBrief = {
  uic: mockTestUic,
  echelon: Echelon.CORPS,
  component: 'ARMY',
  level: 0,
  shortName: 'Test Short Name',
  displayName: 'Test Display Name',
  nickName: 'Test Nick Name',
  state: 'AZ',
  parentUic: 'PARENT_TEST_UIC',
};
