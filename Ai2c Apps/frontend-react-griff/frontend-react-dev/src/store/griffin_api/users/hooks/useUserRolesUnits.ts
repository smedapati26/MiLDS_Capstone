import { useMemo } from 'react';

import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';
import { useGetRolesByUserIdQuery } from '@store/griffin_api/users/slices';

import { IUserRole, UserRoleOptions } from '../models';

/**
 * useUserRolesUnits
 * @description Custom hooks maps & returns IUserRoles units that they have read and write permissions
 *
 * @param userId
 * @returns Array<IUnitBrief> Units the user has admin and write permissions for.
 */
export const useUserRolesUnits = (userId: string): Array<IUnitBrief> => {
  // Fetch Data
  const { data } = useGetRolesByUserIdQuery({ userId: userId });

  // Mapping user roles/users to Owner options
  const userUnits: Array<IUnitBrief> = useMemo(() => {
    if (!data) return [];

    return data
      .filter(
        (userRole: IUserRole) =>
          userRole.accessLevel === UserRoleOptions.ADMIN || userRole.accessLevel === UserRoleOptions.WRITE,
      )
      .map((userRole: IUserRole) => userRole.unit);
  }, [data]);

  return userUnits;
};
