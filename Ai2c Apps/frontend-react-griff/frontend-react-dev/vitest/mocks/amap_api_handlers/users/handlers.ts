import { http, HttpResponse } from 'msw';

import { IElevateRoles } from '@store/amap_api/users/models';

import { mockElevatedRoles } from './mock_data';

export const AMAP_MOCK_BASE_URL = 'http://127.0.0.1:8080/v1/data/users';

export const amapUserHandlers = [
  /* Intercept "GET" get user elevated roles */
  http.get(`${AMAP_MOCK_BASE_URL}/elevated_roles/:userId`, ({ params }) => {
    const { userId } = params;

    // Simulate user not found
    if (userId === 'not-found') {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Simulate server error
    if (userId === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Simulate user with no elevated roles
    if (userId === 'no-roles') {
      return HttpResponse.json<IElevateRoles>({
        viewer: [],
        recorder: [],
        manager: [],
      });
    }

    return HttpResponse.json<IElevateRoles>(mockElevatedRoles);
  }),
];
