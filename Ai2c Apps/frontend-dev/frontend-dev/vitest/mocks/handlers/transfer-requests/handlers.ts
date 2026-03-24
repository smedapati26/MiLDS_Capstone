import { http, HttpResponse } from 'msw';

import { soldierManagerBaseUrl } from '@store/amap_ai/soldier_manager/slices/soldierManagerApi';
import { transferRequestsBaseUrl } from '@store/amap_ai/transfer_request/slices/transferRequestsApi';

import {
  soldierActiveFlagsMock,
  transferRequestsMock,
  unitActiveFlagsMock,
  unitTransferRequestsMock,
} from './mock_data';

/**
 * Handlers for transfer_requests API endpoints.
 */
export const transferRequestHandlers = [
  http.get(`${transferRequestsBaseUrl}/transfer_requests/:get_type`, (req) => {
    const { get_type } = req.params;

    if (!get_type || !transferRequestsMock[get_type as keyof typeof transferRequestsMock]) {
      return HttpResponse.json({ error: 'Transfer requests not found' }, { status: 404 });
    }

    const transferRequests = transferRequestsMock[get_type as keyof typeof transferRequestsMock];
    return HttpResponse.json({ transfer_requests: transferRequests }, { status: 200 });
  }),
  http.get(`${transferRequestsBaseUrl}/transfer-requests`, () => {
    return HttpResponse.json(unitTransferRequestsMock, { status: 200 });
  }),
];

/**
 * Handlers for soldier manager API endpoints.
 */
export const soldierManagerHandlers = [
  http.get(`${soldierManagerBaseUrl}/soldier_exists/:soldierId`, () => {
    HttpResponse.json(true, { status: 200 });
  }),
  http.get(`${soldierManagerBaseUrl}/soldiers/:soldierId/flags`, () => {
    return HttpResponse.json(soldierActiveFlagsMock, { status: 200 });
  }),
  http.get(`${soldierManagerBaseUrl}/unit/:unitUic/flags`, () => {
    return HttpResponse.json(unitActiveFlagsMock, { status: 200 });
  }),
];
