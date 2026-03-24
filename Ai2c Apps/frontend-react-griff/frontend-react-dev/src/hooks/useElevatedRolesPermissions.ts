import { useEffect } from 'react';

import { useGetAmapUserElevatedRolesQuery } from '@store/amap_api/users/slices/amapUsersApi';
import { useGetUserElevatedRolesQuery } from '@store/griffin_api/users/slices';
import { useAppDispatch } from '@store/hooks';
import { setAmapUnitPermissions, setUnitPermissions } from '@store/slices/appSettingsSlice';
import { store } from '@store/store';

/**
 * Custom React hook to manage elevated roles and permissions for a user.
 * This hook fetches elevated roles data from two APIs (Griffin and AMAP) and dispatches
 * actions to update unit permissions in the Redux store based on the user's roles and current UIC.
 *
 * @param userId - The ID of the user whose elevated roles are being fetched.
 * @param currentUic - The current Unit Identification Code (UIC) for the user.
 * @returns void - This hook does not return a value; it manages side effects.
 */
export const useElevatedRolesPermissions = (userId: string, currentUic: string | undefined) => {
  const dispatch = useAppDispatch();

  // Fetch elevated roles from Griffin API
  const { data: elevatedRoles } = useGetUserElevatedRolesQuery(userId);
  // Fetch elevated roles from AMAP API
  const { data: amapElevatedRoles } = useGetAmapUserElevatedRolesQuery(userId);

  // Effect to set unit permissions based on Griffin elevated roles
  useEffect(() => {
    // Only proceed if elevated roles data is available and current UIC is defined
    if (elevatedRoles && currentUic) {
      dispatch(
        setUnitPermissions({
          adminUics: elevatedRoles.admin, // UICs where the user has admin privileges
          writeUics: elevatedRoles.write, // UICs where the user has write privileges
        }),
      );
    }
  }, [elevatedRoles, currentUic, dispatch]);

  // Effect to set AMAP unit permissions based on AMAP elevated roles
  useEffect(() => {
    // Early return if AMAP elevated roles or current UIC are not available
    if (!amapElevatedRoles || !currentUic) return;

    // Get the current app settings state from the Redux store
    const state = store.getState();
    const current = state.appSettings;

    // Check if the AMAP permissions for the current UIC are already set in the store
    // This prevents unnecessary dispatches if the permissions haven't changed
    const alreadySet =
      current.currentUnitAmapManager === amapElevatedRoles.manager.includes(currentUic) && // Manager role check
      current.currentUnitAmapRecorder ===
        (amapElevatedRoles.manager.includes(currentUic) || amapElevatedRoles.recorder.includes(currentUic)) && // Recorder role check (includes manager)
      current.currentUnitAmapViewer ===
        (amapElevatedRoles.manager.includes(currentUic) ||
          amapElevatedRoles.recorder.includes(currentUic) ||
          amapElevatedRoles.viewer.includes(currentUic)); // Viewer role check (includes manager and recorder)

    // If permissions are not already set, dispatch the action to update AMAP unit permissions
    if (!alreadySet) {
      dispatch(
        setAmapUnitPermissions({
          viewerUics: amapElevatedRoles.viewer, // UICs where the user has viewer privileges
          recorderUics: amapElevatedRoles.recorder, // UICs where the user has recorder privileges
          managerUics: amapElevatedRoles.manager, // UICs where the user has manager privileges
        }),
      );
    }
  }, [currentUic, amapElevatedRoles, dispatch]);

  // Return if user is an admin
  return { isAdmin: elevatedRoles ? elevatedRoles.admin.length > 0 : false };
};
