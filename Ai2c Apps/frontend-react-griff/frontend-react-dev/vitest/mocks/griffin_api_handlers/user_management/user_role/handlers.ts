import { http, HttpResponse } from 'msw';

import { IUserRoleIn } from '@store/griffin_api/users/models/IUserRole';
import { USER_ROLE_BASE_URL } from '@store/griffin_api/users/slices/userRoleApi';

import { mockRoles, mockRolesForUser } from './mock_data';

export const userRoleHandlers = [
  /* Intercept "GET" role list */
  http.get(`${USER_ROLE_BASE_URL}/all`, () => {
    return HttpResponse.json<IUserRoleIn[]>(mockRoles);
  }),
  /* Intercept "GET" role by user id */
  http.get(`${USER_ROLE_BASE_URL}/:userId`, ({ request }) => {
    // Retrieve the user id for the role
    const userId = request.url.substring(request.url.lastIndexOf('/') + 1);

    if (!userId) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json<IUserRoleIn[]>(mockRolesForUser);
  }),
  /* Intercept "POST" for creating a new user role */
  http.post(`${USER_ROLE_BASE_URL}`, () => {
    return HttpResponse.json<IUserRoleIn>(mockRolesForUser[0]);
  }),
  /* Intercept "PUT" for updating an existing user role */
  http.put(`${USER_ROLE_BASE_URL}/:userId/:uic`, () => {
    return HttpResponse.json<IUserRoleIn>(mockRolesForUser[0]);
  }),
];
