import { http, HttpResponse } from 'msw';

import { IUserRoleIn } from '@store/griffin_api/users/models/IUserRole';
import { ROLE_REQUEST_BASE_URL } from '@store/griffin_api/users/slices/roleRequestApi';

import { mockRolesForUser } from '../user_role/mock_data';

export const roleRequestHandlers = [
  /* Intercept "GET" role by user id */
  http.get(`${ROLE_REQUEST_BASE_URL}/:userId`, ({ request }) => {

    // Retrieve the user id for the role
    const userId = request.url.substring(request.url.lastIndexOf('/') + 1);
    if (!userId) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json<IUserRoleIn[]>(mockRolesForUser);
  }),
  /* Intercept "POST" for creating a new user role */
  http.post(`${ROLE_REQUEST_BASE_URL}`, () => {
    return HttpResponse.json<IUserRoleIn>(mockRolesForUser[0]);
  }),
  /* Intercept "DELETE" for deleting an existing user role */
  http.delete(`${ROLE_REQUEST_BASE_URL}/:userId/:unitUic`, ({ request }) => {
    const params = request.url.split('/').filter(part => part !== '');
    const unitUic = params.pop();
    const userId = params.pop();

    if (!userId || !unitUic) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json<IUserRoleIn>(mockRolesForUser[0]);
  }),
];
