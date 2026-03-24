import { IUserRoleIn, UserRoleOptions } from '@store/griffin_api/users/models/IUserRole';

import { mockTestUnitDto } from '../../units/mock_data';
import { mockAppUserDto } from '../../users/mock_data';

// Fake User Roles for API
export const mockRolesForUser: IUserRoleIn[] = [
  {
    id: 1,
    user: mockAppUserDto,
    unit: mockTestUnitDto,
    access_level: UserRoleOptions.WRITE,
    granted_on: '01/01/2025',
  },
];

export const mockRoles: IUserRoleIn[] = [
  {
    id: 1,
    user: mockAppUserDto,
    unit: mockTestUnitDto,
    access_level: UserRoleOptions.WRITE,
    granted_on: '01/01/2025',
  },
  {
    id: 2,
    user: {
      user_id: '0000000000',
      first_name: 'Andy',
      last_name: 'Warhol',
      rank: 'CPT',
      new_user: false,
      is_admin: false,
    },
    unit: mockTestUnitDto,
    access_level: UserRoleOptions.WRITE,
    granted_on: '01/01/2025',
  },
  {
    id: 3,
    user: {
      user_id: '51198',
      first_name: 'Bob',
      last_name: 'Ross',
      rank: 'CTR',
      new_user: false,
      is_admin: false,
    },
    unit: mockTestUnitDto,
    access_level: UserRoleOptions.ADMIN,
    granted_on: '11/21/2020',
  },
];
