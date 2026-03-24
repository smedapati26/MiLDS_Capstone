import { describe, expect, it } from 'vitest';

import { Echelon } from '@ai2c/pmx-mui';

import { SubordinateSchemaType } from '@features/task-forces/components/create-stepper/step 2/schema';

import { ITaskForceDetails, ITaskForceDetailsDto, ITaskForceSimpleDto, mapToISubordinateDto, mapToITaskForceDetails, mapToITaskForceSimple, mapToSubordinateSchemaType } from '@store/griffin_api/taskforce/models/ITaskforce';

describe('mapToISubordinateDto', () => {
  it('should correctly map SubordinateSchemaType to ITaskforceBaseDto', () => {
    const subordinate: SubordinateSchemaType = {
      name: 'Alpha Unit',
      echelon: 'Company',
      shortname: 'A-Co',
      ownerId: 'user123',
      nickname: 'The Alphas',
      aircraft: [{ serial: 'SN-A1' }, { serial: 'SN-A2' }],
      uas: [{ serial: 'SN-U1' }],
      agse: [{ serial: 'SN-G1' }, { serial: 'SN-G2' }],
      id: '',
      uuid: '',
      parentId: '',
      level: 0
    };

    const result = mapToISubordinateDto(subordinate);

    expect(result).toEqual({
      tf_name: 'Alpha Unit',
      echelon: 'Company',
      short_name: 'A-Co',
      owner_user_id: 'user123',
      nick_name: 'The Alphas',
      aircraft: ['SN-A1', 'SN-A2'],
      uas: ['SN-U1'],
      agse: ['SN-G1', 'SN-G2'],
      subordinates: [],
    });
  });
});


describe('mapToSubordinateSchemaType', () => {
  it('should correctly map ITaskForceDetails to SubordinateSchemaType', () => {
    const subordinate: ITaskForceDetails = {
      unit: {
        displayName: 'Alpha Unit',
        echelon: Echelon.COMPANY,
        shortName: 'A-Co',
        nickName: 'The Alphas',
        uic: 'UIC',
        parentUic: '',
        level: 0
      },
      owner: {
        userId: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        rank: 'CTR',
        rankAndName: "CTR John Doe",
      },
      aircraft: [{ serial: 'SN-A1', model: 'M1', unit: 'UNIT1', status: 'FMC' }, { serial: 'SN-A2', model: 'M1', unit: 'UNIT1', status: 'FMC' }],
      uas: [{ serial: 'SN-U1', model: 'M1', unit: 'UNIT1', status: 'FMC' }],
      agse: [{ serial: 'SN-G1', model: 'M1', unit: 'UNIT1', status: 'FMC' }, { serial: 'SN-G2', model: 'M1', unit: 'UNIT1', status: 'FMC' }],
      subordinates: [],
      startDate: '01-01-2026',
      endDate: '01-01-2030',
    };

    const result = mapToSubordinateSchemaType(subordinate);

    expect(result).toEqual({
      name: 'Alpha Unit',
      echelon: 'CO',
      shortname: 'A-Co',
      ownerId: 'user123',
      nickname: 'The Alphas',
      aircraft: [{ serial: 'SN-A1', model: 'M1', unit: 'UNIT1', status: 'FMC' }, { serial: 'SN-A2', model: 'M1', unit: 'UNIT1', status: 'FMC' }],
      uas: [{ serial: 'SN-U1', model: 'M1', unit: 'UNIT1', status: 'FMC' }],
      agse: [{ serial: 'SN-G1', model: 'M1', unit: 'UNIT1', status: 'FMC' }, { serial: 'SN-G2', model: 'M1', unit: 'UNIT1', status: 'FMC' }],
      id: 'UIC',
      uuid: 'UIC',
      parentId: '',
      level: 0
    });
  });
});

describe('mapToITaskForceSimple', () => {
  it('should correctly map ITaskForceSimpleDto to ITaskForceSimple', () => {
    const taskforce: ITaskForceSimpleDto = {
      unit: {
        display_name: 'Alpha Unit',
        echelon: Echelon.BATTALION,
        short_name: 'A-Co',
        nick_name: 'The Alphas',
        uic: '',
        parent_uic: '',
        level: 0,
        slogan: "A cool slogan",
      },
      owner: {
        user_id: 'user123',
        first_name: 'John',
        last_name: 'Doe',
        rank: 'CTR',
      },
      location: {
        id: 123,
        code: 'LOC1',
        name: 'Location 1',
      },
      start_date: '01-01-2026',
      end_date: '01-01-2030',
    };

    const result = mapToITaskForceSimple(taskforce);

    expect(result).toEqual({
      unit: {
        displayName: 'Alpha Unit',
        echelon: Echelon.BATTALION,
        shortName: 'A-Co',
        nickName: 'The Alphas',
        uic: '',
        parentUic: '',
        level: 0,
        logo: undefined,
        slogan: "A cool slogan",
      },
      owner: {
        userId: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        rank: 'CTR',
        email: undefined,
        lastActive: undefined,
        rankAndName: "CTR John Doe",
      },
      location: {
        id: 123,
        code: 'LOC1',
        name: 'Location 1',
      },
      startDate: '01-01-2026',
      endDate: '01-01-2030',
    });
  });
});

describe('mapToITaskForceDetails', () => {
  it('should correctly map ITaskForceDetailsDto to ITaskForceDetails', () => {
    const taskforce: ITaskForceDetailsDto = {
      unit: {
        display_name: 'Alpha Unit',
        echelon: Echelon.BATTALION,
        short_name: 'A-Co',
        nick_name: 'The Alphas',
        uic: '',
        parent_uic: '',
        level: 0
      },
      aircraft: [{ serial: 'SN-A1', model: 'M1', unit: 'UNIT1', status: 'FMC' }, { serial: 'SN-A2', model: 'M1', unit: 'UNIT1', status: 'FMC' }],
      uas: [{ serial: 'SN-U1', model: 'M1', unit: 'UNIT1', status: 'FMC' }],
      agse: [{ serial: 'SN-G1', model: 'M1', unit: 'UNIT1', status: 'FMC' }, { serial: 'SN-G2', model: 'M1', unit: 'UNIT1', status: 'FMC' }],
      subordinates: [],
      start_date: '01-01-2026',
      end_date: '01-01-2030',
    };

    const result = mapToITaskForceDetails(taskforce);

    expect(result).toEqual({
      unit: {
        displayName: 'Alpha Unit',
        echelon: Echelon.BATTALION,
        shortName: 'A-Co',
        nickName: 'The Alphas',
        uic: '',
        parentUic: '',
        level: 0
      },
      aircraft: [{ serial: 'SN-A1', model: 'M1', unit: 'UNIT1', status: 'FMC' }, { serial: 'SN-A2', model: 'M1', unit: 'UNIT1', status: 'FMC' }],
      uas: [{ serial: 'SN-U1', model: 'M1', unit: 'UNIT1', status: 'FMC' }],
      agse: [{ serial: 'SN-G1', model: 'M1', unit: 'UNIT1', status: 'FMC' }, { serial: 'SN-G2', model: 'M1', unit: 'UNIT1', status: 'FMC' }],
      subordinates: [],
      startDate: '01-01-2026',
      endDate: '01-01-2030',
    });
  });
});
