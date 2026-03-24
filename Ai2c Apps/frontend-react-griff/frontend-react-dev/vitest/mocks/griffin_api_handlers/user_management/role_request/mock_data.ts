import { IRoleRequestIn } from '@store/griffin_api/users/models/IRoleRequest';
import { UserRoleOptions } from '@store/griffin_api/users/models/IUserRole';

import { mockTestUnitDto } from '../../units/mock_data';
import { mockAppUserDto, mockUsersDto } from '../../users/mock_data';

// Fake Role Requests for API
export const mockRoleRequests: IRoleRequestIn[] = [
  {
    id: 1,
    user_id: mockAppUserDto.user_id,
    unit: mockTestUnitDto,
    access_level: UserRoleOptions.ADMIN,
    date_created: '01/01/2025',
    approvers: [mockUsersDto[0]]
  },
  {
    id: 2,
    user_id: mockAppUserDto.user_id,
    unit: mockTestUnitDto,
    access_level: UserRoleOptions.WRITE,
    date_created: '12/01/2023',
    approvers: [mockUsersDto[0], mockUsersDto[1]]
  },
];
