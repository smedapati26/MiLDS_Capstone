import { IAdminRoleRequestIn } from "@store/griffin_api/users/models/IAdminRoleRequest";
import { UserRoleOptions } from "@store/griffin_api/users/models/IUserRole";

import { mockTestUnitDto } from "../../units/mock_data";


export const mockRoleRequests: IAdminRoleRequestIn[] = [
  {
    id: 1,
    user: {
      user_id: '0000000000',
      first_name: 'Jane',
      last_name: 'Day',
      rank: 'CPT',
    },
    unit: mockTestUnitDto,
    access_level: UserRoleOptions.WRITE,
    current_role: UserRoleOptions.READ,
    date_created: '01/01/2025',
  },
  {
    id: 2,
    user: {
      user_id: '51198',
      first_name: 'John',
      last_name: 'Doe',
      rank: 'CPT',
    },
    unit: mockTestUnitDto,
    access_level: UserRoleOptions.ADMIN,
    current_role: UserRoleOptions.READ,
    date_created: '01/01/2025',
  },
];
