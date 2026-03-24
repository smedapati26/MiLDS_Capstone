import { Echelon } from '@ai2c/pmx-mui/models';

import { IUnitBrief, IUnitBriefDto } from '@store/griffin_api/auto_dsr/models';
import { IBankTimeForecastDto } from '@store/griffin_api/auto_dsr/models';
import {
  AcdUploadStatus,
  IAcdHistoryOut,
  IAutoDsrDto,
  IAutoDsrLocationDto,
} from '@store/griffin_api/auto_dsr/models/IAutoDsr';
import { IFlyingHoursDto } from '@store/griffin_api/auto_dsr/models/IFlyingHours';
import { ITransferRequest, ITransferRequestUser, TransferObjectType, TransferStatus } from '@store/griffin_api/auto_dsr/models/ITransferRequest';

// Mock Auto DSR Data
export const mockAutoDsrDto: IAutoDsrDto = {
  serial_number: '12345',
  owning_unit_uic: 'TEST_UIC',
  owning_unit_name: 'Test Unit',
  current_unit_uic: 'TEST_UIC',
  current_unit_name: 'Test Unit',
  location: {
    abbreviation: 'B1',
    code: 'B1',
    mgrs: 'mgrs1',
    name: 'Base 1',
    short_name: 'B1',
  },
  model: 'F-35A',
  status: 'FMC',
  rtl: 'RTL',
  remarks: 'Test remarks',
  date_down: '2023-01-01',
  ecd: '2023-12-31',
  hours_to_phase: 100,
  flying_hours: 500,
  last_sync_time: '2023-01-01T00:00:00Z',
  last_export_upload_time: '2023-01-01T00:00:00Z',
  last_user_edit_time: '2023-01-01T00:00:00Z',
  data_update_time: '2023-01-01T00:00:00Z',
  modifications: [],
};

// Mock Bank Time Projection Data
export const mockBankTimeProjectionDto: IBankTimeForecastDto = {
  'F-35A': {
    '2023-01-01': 100,
    '2023-01-02': 200,
  },
};

// Mock Flying Hours Data
export const mockFlyingHoursDto: IFlyingHoursDto = {
  monthly_hours_flown: 150,
  monthly_hours_total: 200,
  yearly_hours_flown: 1800,
  yearly_hours_total: 2400,
};

// Mock Unit Data
export const mockUnitBriefDto: IUnitBriefDto = {
  uic: 'TEST_UIC',
  echelon: Echelon.CORPS,
  component: 'ARMY',
  level: 0,
  short_name: 'Test Short Name',
  display_name: 'Test Display Name',
  nick_name: 'Test Nick Name',
  state: 'AZ',
  parent_uic: 'PARENT_TEST_UIC',
};

// Mock Similar Units Response
export const mockSimilarUnitsResponse = {
  similar_units: ['SIMILAR_UIC1', 'SIMILAR_UIC2'],
};

export const mockAutoDsrLocationDto: IAutoDsrLocationDto[] = [
  {
    id: 1,
    name: 'test',
    code: 'test',
  },
  {
    id: 1,
    name: 'test',
    code: 'test',
  },
  {
    id: 1,
    name: 'test',
    code: 'test',
  },
];

export const mockAutoDsrSingleUnitInfoDto = {
  uic: 'test unit',
  short_name: 'short name',
  display_name: 'display name',
  nick_name: '',
  echelon: 'Echelon',
  parent_uic: 'parent uic',
  level: 5,
  similar_units: [
    {
      uic: 'uic1',
      short_name: 'short uic1',
    },
    {
      uic: 'uic2',
      short_name: 'short uic2',
    },
    {
      uic: 'uic3',
      short_name: 'short uic3',
    },
    {
      uic: 'uic4',
      short_name: 'short uic4',
    },
    {
      uic: 'uic5',
      short_name: 'short uic5',
    },
  ],
};

export const mockAcdHistory = {
  items: [
    {
      id: 1,
      file_name: 'ACD_2026_02_04.txt',
      uploaded_at: '2026-02-04T10:30:00Z',
      status: 'Completed',
      succeeded: true,
      user: {
        first_name: 'John',
        last_name: 'Doe',
      },
    },
    {
      id: 2,
      file_name: 'ACD_2026_02_03.txt',
      uploaded_at: '2026-02-03T14:20:00Z',
      status: 'Completed',
      succeeded: true,
      user: {
        first_name: 'Jane',
        last_name: 'Smith',
      },
    },
    {
      id: 3,
      file_name: 'ACD_2026_02_02.txt',
      uploaded_at: '2026-02-02T09:15:00Z',
      status: 'Failed',
      succeeded: false,
      user: {
        first_name: 'Bob',
        last_name: 'Johnson',
      },
    },
  ],
  total: 3,
  limit: 10,
  offset: 0,
};

export const mockLatestHistory = {
  id: 1,
  file_name: 'ACD_2026_02_04.txt',
  uploaded_at: '2026-02-04T10:30:00Z',
  status: 'Completed',
  succeeded: true,
  user: {
    first_name: 'John',
    last_name: 'Doe',
  },
};

export const mockAcdUploadHistoryData: IAcdHistoryOut[] = [
  {
    id: 1,
    fileName: 'ACD_2026_02_04.txt',
    uploadedAt: new Date('2026-02-04T10:30:00Z'),
    status: 'Completed' as AcdUploadStatus,
    succeeded: true,
    user: {
      firstName: 'John',
      lastName: 'Doe',
      userId: '',
      rank: '',
      isAdmin: false,
      unit: undefined as unknown as IUnitBrief,
      newUser: false,
    },
    unit: '',
    uploadType: '',
    sync: false,
  },
  {
    id: 2,
    fileName: 'ACD_2026_02_03.txt',
    uploadedAt: new Date('2026-02-03T14:20:00Z'),
    status: 'Completed' as AcdUploadStatus,
    succeeded: true,
    user: {
      firstName: 'Bob',
      lastName: 'Johnson',
      userId: '',
      rank: '',
      isAdmin: false,
      unit: undefined as unknown as IUnitBrief,
      newUser: false,
    },
    unit: '',
    uploadType: '',
    sync: false,
  },
  {
    id: 3,
    fileName: 'ACD_2026_02_02.txt',
    uploadedAt: new Date('2026-02-02T09:15:00Z'),
    status: 'Completed' as AcdUploadStatus,
    succeeded: false,
    user: {
      firstName: 'Jane',
      lastName: 'Smith',
      userId: '',
      rank: '',
      isAdmin: false,
      unit: undefined as unknown as IUnitBrief,
      newUser: false,
    },
    unit: '',
    uploadType: '',
    sync: false,
  },
];
export const mockEquipmentTransferRequests: ITransferRequest[] = [{
  id: 0,
  aircraft: null,
  model: null,
  uac: null,
  uav: null,
  originatingUic: '',
  originatingName: '',
  destinationUic: '',
  destinationName: '',
  requestedByUser: {
    userId: '1234567890',
    rank: 'CTR',
    firstName: 'Joe',
    lastName: 'Doe',
    email: 'joe.doe.ctr@email.com'
  } as ITransferRequestUser,
  requestedObjectType: TransferObjectType.AIRCRAFT,
  originatingUnitApproved: false,
  destinationUnitApproved: false,
  permanentTransfer: false,
  dateRequested: '',
  status: TransferStatus.ACCEPTED,
  lastUpdatedDatetime: ''
}];
