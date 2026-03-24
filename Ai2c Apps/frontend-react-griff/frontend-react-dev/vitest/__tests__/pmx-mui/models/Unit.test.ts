import { Echelon } from '@ai2c/pmx-mui/models/Echelon';
import { mapUnitDtoToUnit, Unit, UnitDto } from '@ai2c/pmx-mui/models/Unit';

describe('mapUnitDtoToUnit', () => {
  it('should map UnitDto to Unit correctly', () => {
    const dto: UnitDto = {
      uic: '12345',
      short_name: 'Short Name',
      display_name: 'Display Name',
      nick_name: 'Nickname',
      echelon: Echelon.BRIGADE,
      compo: 'Component',
      state: 'State',
      parent_uic: '54321',
      level: 1,
    };

    const expectedUnit: Unit = {
      uic: '12345',
      shortName: 'Short Name',
      displayName: 'Display Name',
      nickname: 'Nickname',
      echelon: Echelon.BRIGADE,
      component: 'Component',
      state: 'State',
      parentUic: '54321',
      level: 1,
    };

    const result = mapUnitDtoToUnit(dto);
    expect(result).toEqual(expectedUnit);
  });

  it('should handle null values correctly', () => {
    const dto: UnitDto = {
      uic: '12345',
      short_name: 'Short Name',
      display_name: 'Display Name',
      nick_name: null,
      echelon: Echelon.BRIGADE,
      compo: 'Component',
      state: null,
      parent_uic: null,
      level: 1,
    };

    const expectedUnit: Unit = {
      uic: '12345',
      shortName: 'Short Name',
      displayName: 'Display Name',
      nickname: null,
      echelon: Echelon.BRIGADE,
      component: 'Component',
      state: null,
      parentUic: '',
      level: 1,
    };

    const result = mapUnitDtoToUnit(dto);
    expect(result).toEqual(expectedUnit);
  });
});
