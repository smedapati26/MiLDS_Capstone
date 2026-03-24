import { Echelon } from '@ai2c/pmx-mui/models';

import { IAppUser, IAppUserDto, ICreateAppUserOut, mapToIAppUser } from '@store/griffin_api/users/models/IAppUser';

import { mockTestUnitDto } from '../units/mock_data';

export const mockAppUserDto: IAppUserDto = {
  user_id: '0123456789',
  first_name: 'Testy',
  last_name: 'McGee',
  rank: 'CTR',
  is_admin: true,
  new_user: false,
  default_unit: {
    uic: 'WCLMAA',
    short_name: '3-25 GSAB',
    display_name: '3rd Battalion, 25th Aviation Regiment',
    echelon: Echelon.BATTALION,
    level: 3,
    component: '1',
    nick_name: '',
    state: '',
    parent_uic: '',
  },
  global_unit: {
    uic: 'WCLMAA',
    short_name: '3-25 GSAB',
    display_name: '3rd Battalion, 25th Aviation Regiment',
    echelon: Echelon.BATTALION,
    level: 3,
    component: '1',
    nick_name: '',
    state: '',
    parent_uic: '',
  },
  job_description: 'An important job.',
  last_activity: '2025-01-01',
};

export const mockAppUser: IAppUser = {
  userId: '0123456789',
  firstName: 'Testy',
  lastName: 'McGee',
  fullname: 'Testy McGee',
  rankAndName: 'CTR Testy McGee',
  rank: 'CTR',
  isAdmin: true,
  newUser: false,
  unit: {
    uic: 'WCLMAA',
    shortName: '3-25 GSAB',
    displayName: '3rd Battalion, 25th Aviation Regiment',
    echelon: Echelon.BATTALION,
    level: 3,
    component: '1',
    nickName: '',
    state: '',
    parentUic: '',
  },
  globalUnit: {
    uic: 'WCLMAA',
    shortName: '3-25 GSAB',
    displayName: '3rd Battalion, 25th Aviation Regiment',
    echelon: Echelon.BATTALION,
    level: 3,
    component: '1',
    nickName: '',
    state: '',
    parentUic: '',
  },
  jobDescription: 'An important job.',
  lastActive: '01/01/2025',
};

// Additional mock data for testing
export const mockCreateUserPayload: ICreateAppUserOut = {
  user_id: '9876543210',
  first_name: 'John',
  last_name: 'Doe',
  rank: 'SGT',
  unit_uic: 'TESTAA',
};

export const mockCreatedUserDto: IAppUserDto = {
  user_id: '9876543210',
  first_name: 'John',
  last_name: 'Doe',
  rank: 'SGT',
  is_admin: false,
  new_user: true,
  default_unit: {
    uic: 'TESTAA',
    short_name: 'Test Unit',
    display_name: 'Test Unit Display Name',
    echelon: Echelon.COMPANY,
    level: 2,
    component: '1',
    nick_name: '',
    state: '',
    parent_uic: '',
  },
  global_unit: {
    uic: 'TESTAA',
    short_name: 'Test Unit',
    display_name: 'Test Unit Display Name',
    echelon: Echelon.COMPANY,
    level: 2,
    component: '1',
    nick_name: '',
    state: '',
    parent_uic: '',
  },
  job_description: 'An important job.',
  last_activity: '2025-01-01',
};

export const mockCreatedUser: IAppUser = mapToIAppUser(mockCreatedUserDto);

export const mockUpdatedUserDto: IAppUserDto = {
  user_id: '0123456789',
  first_name: 'Updated',
  last_name: 'User',
  rank: 'LT',
  is_admin: false,
  new_user: false,
  default_unit: {
    uic: 'WCLMAA',
    short_name: '3-25 GSAB',
    display_name: '3rd Battalion, 25th Aviation Regiment',
    echelon: Echelon.BATTALION,
    level: 3,
    component: '1',
    nick_name: '',
    state: '',
    parent_uic: '',
  },
  global_unit: {
    uic: 'TESTAA',
    short_name: 'Test Unit',
    display_name: 'Test Unit Display Name',
    echelon: Echelon.COMPANY,
    level: 2,
    component: '1',
    nick_name: '',
    state: '',
    parent_uic: '',
  },
  job_description: 'An important job.',
  last_activity: '2025-01-01',
};

export const mockUpdatedUser: IAppUser = mapToIAppUser(mockUpdatedUserDto);

export const mockElevatedRoles = {
  admin: ['WCLMAA', 'TESTAA'],
  write: ['WCLMAA', 'TESTAA', 'WRITEAA'],
};

export const mockUsersDto: IAppUserDto[] = [
  {
    user_id: '0000000000',
    first_name: 'John',
    last_name: 'Silvers',
    rank: 'CPT',
    is_admin: false,
    new_user: false,
    default_unit: mockTestUnitDto,
    global_unit: mockTestUnitDto,
    job_description: '',
    last_activity: '2025-01-01',
  },
  {
    user_id: '0000000001',
    first_name: 'Mick',
    last_name: 'Donalds',
    rank: 'CPT',
    is_admin: false,
    new_user: false,
    default_unit: mockTestUnitDto,
    global_unit: mockTestUnitDto,
    job_description: '',
    last_activity: '2025-01-01',
  },
];
