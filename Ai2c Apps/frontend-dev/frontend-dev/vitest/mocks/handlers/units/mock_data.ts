import { Echelon } from '@ai2c/pmx-mui';

import { IUnitBriefDto } from '@store/amap_ai/units/models';

export const mockTestUic = 'TEST_UIC';

// Fake Unit from API
export const mockTestUnit: IUnitBriefDto = {
  uic: mockTestUic,
  echelon: Echelon.CORPS,
  component: 'ARMY',
  level: 0,
  short_name: 'Test Short Name',
  display_name: 'Test Display Name',
  nick_name: 'Test Nick Name',
  state: 'AZ',
  parent_unit: 'PARENT_TEST_UIC',
};
