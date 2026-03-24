import { describe, expect, it } from 'vitest';

import { ISoldier, ISoldierDTO } from '@store/amap_ai/soldier/models';
import { mapResponseData } from '@utils/helpers/dataTransformer';

describe('mapResponseData', () => {
  it('should map ISoldierDTO to ISoldier correctly', () => {
    const dto: ISoldierDTO = {
      user_id: '123',
      first_name: 'John',
      last_name: 'Doe',
      birth_month: 'January',
      all_mos_and_ml: [],
      is_admin: true,
      is_maintainer: false,
      receive_emails: true,
      unit_id: 'Unit A',
      unit: 'ETS/PENDING',
    };

    const expected: ISoldier = {
      userId: '123',
      firstName: 'John',
      lastName: 'Doe',
      birthMonth: 'January',
      allMosAndMl: [],
      isAdmin: true,
      isMaintainer: false,
      receiveEmails: true,
      unitId: 'Unit A',
      unit: 'ETS/PENDING',
    };

    const result = mapResponseData(dto);
    expect(result).toEqual(expected);
  });

  it('should handle null values in ISoldierDTO', () => {
    const dto: ISoldierDTO = {
      user_id: '123',
      first_name: 'John',
      last_name: 'Doe',
      birth_month: 'January',
      all_mos_and_ml: [],
      is_admin: true,
      is_maintainer: false,
      receive_emails: true,
      unit_id: 'Unit A',
      unit: 'ETS/PENDING',
      primary_mos: '123',
      pv2_dor: undefined,
      pfc_dor: undefined,
      spc_dor: undefined,
      sgt_dor: undefined,
      ssg_dor: undefined,
      sfc_dor: undefined,
    };

    const expected: ISoldier = {
      userId: '123',
      firstName: 'John',
      lastName: 'Doe',
      birthMonth: 'January',
      allMosAndMl: [],
      isAdmin: true,
      isMaintainer: false,
      receiveEmails: true,
      unitId: 'Unit A',
      unit: 'ETS/PENDING',
      primaryMos: '123',
      pv2Dor: undefined,
      pfcDor: undefined,
      spcDor: undefined,
      sgtDor: undefined,
      ssgDor: undefined,
      sfcDor: undefined,
    };

    const result = mapResponseData(dto);
    expect(result).toEqual(expected);
  });
});
