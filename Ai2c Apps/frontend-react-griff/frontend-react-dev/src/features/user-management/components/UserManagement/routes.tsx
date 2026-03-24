import { lazy } from 'react';
import { redirect, RouteObject } from 'react-router-dom';

import { TabsLayoutProps } from '@ai2c/pmx-mui/components/layout/TabsLayout';

import { BadgeTabsLayout } from '@components/utils/BadgeTabsLayout';

import { useGetAllRoleRequestsForAdminQuery } from '@store/griffin_api/users/slices/adminRoleRequestApi';

// Route Configuration Array
const UserPermissionsTab = lazy(() => import('./UserPermissionsTab'));
const PermissionsRequestTab = lazy(() => import('./PermissionRequestsTab'));

export const userManagementRoutes: Array<RouteObject> = [
  { index: true, label: 'user-management-index', path: '', loader: () => redirect('permissions') },
  { label: 'User Permissions', path: 'permissions', element: <UserPermissionsTab /> },
  { label: 'Permission Requests', path: 'requests', element: <PermissionsRequestTab /> },
];

/**
 * User Management Tabs Layout
 * User Management Tabs Layout Component to add in Request Tab with Notification Badge.
 *
 * @param { TabsLayoutProps } props
 */

export const UserManagementTabsLayout = ({ title, routes = userManagementRoutes }: TabsLayoutProps) => {
  const badgeRoutes = ['requests'];
  const { data } = useGetAllRoleRequestsForAdminQuery(undefined);

  return (
    <BadgeTabsLayout title={title} routes={routes} badgeRoutes={badgeRoutes} badgeCount={data ? data.length : 0} />
  );
};
