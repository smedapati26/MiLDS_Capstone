// dataTransformer.test.ts
import { describe, expect, it } from 'vitest';

import { TransferRequestDto } from '@store/amap_ai/transfer_request';
import { mapResponseData } from '@utils/helpers/dataTransformer';

describe('mapTransferRequestDtoToModel', () => {
  it('transforms TransferRequestDto to TransferRequest correctly', () => {
    const mockDto: TransferRequestDto = {
      requester_name: 'MAJ Emma Torres',
      soldier_user_id: 'USR123456',
      soldier_unit_uic: 'UIC789001',
      soldier_name: 'CPT Liam Nguyen',
      soldier_unit_short_name: '1st Brigade',
      gaining_unit_short_name: '3rd Battalion',
      gaining_unit_uic: 'UIC456321',
      managers: [{ name: 'COL Sarah Chen', unit: '1st Brigade', dod_email: 'sarah.chen@army.mil' }],
    };

    const result = mapResponseData(mockDto);

    expect(result).toEqual({
      requesterName: 'MAJ Emma Torres',
      soldierUserId: 'USR123456',
      soldierUnitUic: 'UIC789001',
      soldierName: 'CPT Liam Nguyen',
      soldierUnitShortName: '1st Brigade',
      gainingUnitShortName: '3rd Battalion',
      gainingUnitUic: 'UIC456321',
      managers: [{ name: 'COL Sarah Chen', unit: '1st Brigade', dodEmail: 'sarah.chen@army.mil' }],
    });
  });
});
