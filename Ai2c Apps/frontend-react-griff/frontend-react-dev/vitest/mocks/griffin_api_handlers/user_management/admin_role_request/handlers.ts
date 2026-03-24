import { http, HttpResponse } from 'msw';

import { IAdminRoleRequestIn } from '@store/griffin_api/users/models/IAdminRoleRequest';
import { ROLE_REQUEST_ADMIN_BASE_URL } from '@store/griffin_api/users/slices/adminRoleRequestApi';

import { mockRoleRequests } from './mock_data';

/**
 * An array of request handlers for Admin Role Request API endpoints.
 */
export const adminRoleRequestHandlers = [
  /* Intercept "GET" Role Request list */
  http.get(`${ROLE_REQUEST_ADMIN_BASE_URL}`, () => {
    return HttpResponse.json<IAdminRoleRequestIn[]>(mockRoleRequests);
  }),
  /* Intercept "PUT" Role Request */
  http.put(`${ROLE_REQUEST_ADMIN_BASE_URL}/:status/:userId/:unitUic`, () => {
    return HttpResponse.json<IAdminRoleRequestIn>(mockRoleRequests[0]);
  }),
];
