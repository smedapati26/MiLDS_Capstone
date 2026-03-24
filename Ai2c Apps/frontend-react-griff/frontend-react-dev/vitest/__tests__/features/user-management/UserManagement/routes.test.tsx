import { describe, expect, it } from 'vitest';

import { userManagementRoutes } from '@features/user-management/components/UserManagement/routes';


describe('userManagementRoutes', () => {
  it('should have a route for User Permisisons', () => {
    const permissionsRoute = userManagementRoutes.find((route) => route.path === 'permissions');
    expect(permissionsRoute).toBeDefined();
  });

  it('should have a route for Permission Requests', () => {
    const requestsRoute = userManagementRoutes.find((route) => route.path === 'requests');
    expect(requestsRoute).toBeDefined();
  });
});
