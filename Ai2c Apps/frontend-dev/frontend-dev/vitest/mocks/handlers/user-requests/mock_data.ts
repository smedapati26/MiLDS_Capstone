import { IUnitPermissionRequestDTO } from '@store/amap_ai/user_request';

export const permissionRequestsMock: IUnitPermissionRequestDTO[] = [
  {
    requests: [
      {
        current_role: 'Viewer',
        dod_id: '1234567890',
        last_active: '01/01/2025',
        name: 'Test MeGee',
        rank: 'CPT',
        request_id: 1,
        requested_role: 'Manager',
        unit: 'TSTUNIT',
      },
      {
        current_role: 'Approver',
        dod_id: '0123456789',
        last_active: '12/01/2025',
        name: 'Tester MeGeer',
        rank: 'CTR',
        request_id: 2,
        requested_role: 'Viewer',
        unit: 'TSTUNIT',
      },
    ],
    unit_name: 'Permission Unit',
    unit_uic: 'PERMISSION',
  },
];
