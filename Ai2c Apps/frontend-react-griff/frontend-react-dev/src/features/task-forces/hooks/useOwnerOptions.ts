import { useMemo } from 'react';

import { IOptionType } from '@models/IOptions';

import { useGetRolesQuery } from '@store/griffin_api/users/slices';
import { useAppSelector } from '@store/hooks';
import { selectAppUser } from '@store/slices';

export const useOwnerOptions = (): IOptionType<string>[] => {
  const appUser = useAppSelector(selectAppUser);

  // Fetch Data
  const { data: roles } = useGetRolesQuery(undefined);

  // Mapping user roles/users to Owner options
  const ownerOptions: IOptionType<string>[] = useMemo(() => {
    if (!roles) return [{ label: appUser.rankAndName as string, value: appUser.userId as string }];

    const users = roles?.map((role) => role.user);
    const deDupeUsers = users?.filter(
      (user, index, self) => index === self.findIndex((item) => item.userId === user.userId),
    );
    return deDupeUsers.map(({ rankAndName, userId }) => ({ label: rankAndName as string, value: userId as string }));
  }, [appUser.rankAndName, appUser.userId, roles]);

  return ownerOptions;
};
