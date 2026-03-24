import { Navigate, Outlet } from 'react-router-dom';

import { useElevatedRolesPermissions } from '@hooks/useElevatedRolesPermissions';

import { useAppSelector } from '@store/hooks';

const AdminRoute = () => {
  const appUser = useAppSelector((state) => state.appSettings.appUser);
  const { isAdmin: isUnitAdmin } = useElevatedRolesPermissions(appUser.userId, undefined);

  // Render if admin
  if (appUser.isAdmin || isUnitAdmin) {
    return <Outlet />;
  }

  // Redirect for non-admins
  return <Navigate to="/" replace />;
};

export default AdminRoute;
