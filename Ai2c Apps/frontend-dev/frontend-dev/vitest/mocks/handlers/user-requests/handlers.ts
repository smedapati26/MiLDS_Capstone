import { http, HttpResponse } from 'msw';

import { transferRequestsBaseUrl } from '@store/amap_ai/transfer_request/slices/transferRequestsApi';

import { permissionRequestsMock } from './mock_data';

/**
 * Handlers for user_requests API endpoints.
 */
export const userRequestHandlers = [
  http.get(`${transferRequestsBaseUrl}/permission-requests`, () => {
    return HttpResponse.json(permissionRequestsMock, { status: 200 });
  }),
];
