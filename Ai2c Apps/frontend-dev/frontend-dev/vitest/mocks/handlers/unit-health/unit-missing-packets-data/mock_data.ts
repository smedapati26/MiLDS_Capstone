import { IUnitMissingPacketsSoldierDataDTO } from '@store/amap_ai/unit_health';

export const mockUnitMissingPacketsData: IUnitMissingPacketsSoldierDataDTO[] = [
  {
    packet_status: 'Uploaded',
    name: 'Test Megee',
    unit: 'TSTUNIT1',
    user_id: 'tstsoldier1',
    arrival_at_unit: '05/11/1998',
  },
  {
    packet_status: 'Missing',
    name: 'Testy Megeey',
    unit: 'TSTUNIT2',
    user_id: 'tstsoldier2',
    arrival_at_unit: '07/22/2025',
  },
];
