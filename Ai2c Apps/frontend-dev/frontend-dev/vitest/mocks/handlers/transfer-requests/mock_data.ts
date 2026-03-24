import {
  ISoldierActiveFlagDTO,
  ISoldierInfoDTO,
  IUnitActiveFlagDTO,
  IUnitReceivedTransferRequestDTO,
  IUnitSentTransferRequestDTO,
  IUnitSoldierFlagDTO,
} from '@store/amap_ai/soldier_manager';
import { TransferRequest } from '@store/amap_ai/transfer_request';

export const transferRequestsMock: TransferRequest[] = [
  {
    requesterName: 'MAJ Emily Davis',
    soldierUserId: 'USR0001',
    soldierUnitUic: 'UIC00123',
    soldierName: 'CPT Noah Brooks',
    soldierUnitShortName: 'Alpha Company',
    gainingUnitShortName: 'Bravo Battalion',
    gainingUnitUic: 'UIC99876',
    managers: [
      {
        name: 'COL Rachel Kim',
        unit: 'Alpha Company',
        dodEmail: 'rachel.kim@army.mil',
      },
      {
        name: 'MAJ Marcus Lee',
        unit: 'Alpha Company',
        dodEmail: 'marcus.lee@army.mil',
      },
    ],
  },
  {
    requesterName: 'CPT Olivia Martinez',
    soldierUserId: 'USR0002',
    soldierUnitUic: 'UIC00456',
    soldierName: '1LT Ethan Moore',
    soldierUnitShortName: 'Echo Troop',
    gainingUnitShortName: 'Support Squadron',
    gainingUnitUic: 'UIC11223',
    managers: [
      {
        name: 'LTC Brian Chen',
        unit: 'Echo Troop',
        dodEmail: 'brian.chen@army.mil',
      },
    ],
  },
];

export const soldierActiveFlagsMock: ISoldierActiveFlagDTO[] = [
  {
    flag_id: 1,
    flag_info: 'Other Info',
    flag_type: 'Other',
    start_date: '01/01/2025',
    end_date: undefined,
    mx_availability: 'Available',
    remarks: 'Flag 1 Remarks',
  },
  {
    flag_id: 2,
    flag_info: 'Administrative',
    flag_type: 'Leave',
    start_date: '02/02/2025',
    end_date: '03/03/2025',
    mx_availability: 'Unavailable',
    remarks: undefined,
  },
];

export const unitActiveFlagsMock: IUnitActiveFlagDTO[] = [
  {
    flag_id: 1,
    unit: 'Test Unit',
    unit_uic: 'TESTUNIT',
    flag_type: 'Unit',
    flag_info: 'Unit Availability',
    mx_availability: 'Available',
    maintainer_count: 3,
    start_date: '01/01/2025',
    end_date: undefined,
    remarks: undefined,
  },
];

export const unitSoldierFlagsMock: IUnitSoldierFlagDTO[] = [
  {
    dod_id: '1234567890',
    designations: 'TX',
    mx_availability: 'Available',
    name: 'Test MeGee',
    rank: 'CPT',
    roles: ['Viewer'],
    unit: 'TESTUNIT',
    is_maintainer: true,
    is_amtp_maintainer: true,
  },
  {
    dod_id: '2345678901',
    designations: 'TS',
    mx_availability: 'Unavailable',
    name: 'Tester MeGeer',
    rank: 'SSG',
    roles: [],
    unit: 'TESTUNIT',
    is_maintainer: true,
    is_amtp_maintainer: true,
  },
];

export const soldierInfoMock: ISoldierInfoDTO = {
  dod_id: '1234567890',
  additional_mos: ['15A'],
  current_unit: 'TESTUNIT',
  name: 'Test MeGee',
  primary_mos: '19A',
  rank: 'CPT',
  unit_roles_and_designations: [
    {
      designation_id: 1,
      designation_type: 'AE',
      role_id: undefined,
      role_type: undefined,
      unit_name: 'Test Unit',
      unit_uic: 'TESTUNIT',
    },
    {
      designation_id: undefined,
      designation_type: undefined,
      role_id: 1,
      role_type: 'Manager',
      unit_name: 'Test Unit',
      unit_uic: 'TESTUNIT',
    },
  ],
  is_maintainer: true,
};

export const unitTransferRequestsMock: {
  receivedRequests: IUnitReceivedTransferRequestDTO[];
  sentRequests: IUnitSentTransferRequestDTO[];
} = {
  receivedRequests: [
    {
      current_unit: 'Test Unit Two',
      current_unit_uic: 'TSTUNITTWO',
      dod_id: '2345678901',
      name: 'Testest MeGeest',
      rank: 'GNL',
      request_id: 1,
      requested_by: 'CPT Test MeGee',
      requesting_unit: 'Test Unit',
      requesting_unit_uic: 'TSTUNIT',
    },
  ],
  sentRequests: [
    {
      current_unit: 'Test Unit',
      current_unit_uic: 'TSTUNIT',
      dod_id: '1234567890',
      name: 'CPT Test MeGee',
      pocs: [{ email: 'tstemail@email.com', name: 'GNL Testest MeGeest' }],
      rank: 'CPT',
      request_id: 2,
      requesting_unit: 'Test Unit Two',
      requesting_unit_uic: 'TSTUNITTWO',
    },
  ],
};
