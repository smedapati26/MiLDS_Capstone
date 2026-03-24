import { useAppSelector } from '@store/hooks';
import { RootState } from '@store/store';

type RoleType = 'viewer' | 'manager' | 'recorder';

export default function useUnitAccess() {
  const { appUser, currentUic } = useAppSelector((state: RootState) => state.appSettings ?? {});

  function hasRole(roleType: RoleType): boolean {
    return Array.isArray(appUser?.unitRoles?.[roleType]) && appUser.unitRoles[roleType].includes(currentUic);
  }

  function isManagerOfUnit(unitUic: string): boolean {
    return (
      appUser?.isAdmin === true ||
      (Array.isArray(appUser?.unitRoles?.manager) && appUser.unitRoles.manager.includes(unitUic))
    );
  }

  return { hasRole, isManagerOfUnit };
}
