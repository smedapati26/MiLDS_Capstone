import { describe, expect, it } from 'vitest';

import { SubordinateSchemaType } from '@features/task-forces/components/create-stepper/step 2/schema';

import { mapToITaskforceUpdateEquipmentSubordinateDto, mapToITaskforceUpdateUnitSubordinateDto } from '@store/griffin_api/taskforce/models/ITaskforceUpdate';

describe('mapToITaskforceUpdateSubordinateDto', () => {
  it('should correctly map SubordinateSchemaType to ITaskforceUpdateUnitSubordinateDto', () => {
    const subordinate: SubordinateSchemaType = {
      name: 'Alpha Unit',
      echelon: 'Company',
      shortname: 'A-Co',
      ownerId: 'user123',
      nickname: 'The Alphas',
      aircraft: [{ serial: 'SN-A1' }, { serial: 'SN-A2' }],
      uas: [{ serial: 'SN-U1' }],
      agse: [{ serial: 'SN-G1' }, { serial: 'SN-G2' }],
      id: "TF-000",
      uuid: "TF-000",
      parentId: '',
      level: 0
    };

    const result = mapToITaskforceUpdateUnitSubordinateDto(subordinate);

    expect(result).toEqual({
      uic: "TF-000",
      tf_name: 'Alpha Unit',
      echelon: 'Company',
      short_name: 'A-Co',
      owner_user_id: 'user123',
      nick_name: 'The Alphas',
      subordinates: [],
    });
  });
});



describe('mapToITaskforceUpdateEquipmentSubordinateDto', () => {
  it('should correctly map SubordinateSchemaType to ITaskforceUpdateEquipmentSubordinateDto', () => {
    const subordinate: SubordinateSchemaType = {
      name: 'Alpha Unit',
      echelon: 'Company',
      shortname: 'A-Co',
      ownerId: 'user123',
      nickname: 'The Alphas',
      aircraft: [{ serial: 'SN-A1' }, { serial: 'SN-A2' }],
      uas: [{ serial: 'SN-U1' }],
      agse: [{ serial: 'SN-G1' }, { serial: 'SN-G2' }],
      id: "TF-000",
      uuid: "TF-000",
      parentId: '',
      level: 0
    };

    const result = mapToITaskforceUpdateEquipmentSubordinateDto(subordinate);

    expect(result).toEqual({
      uic: "TF-000",
      tf_name: 'Alpha Unit',
      aircraft: ['SN-A1', 'SN-A2'],
      uas: ['SN-U1'],
      agse: ['SN-G1', 'SN-G2' ],
      subordinates: [],
    });
  });
});
