/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse } from 'msw';

import { UAS_BASE_URL } from '@store/griffin_api/base_urls';
import { IUasDto, IUasOut } from '@store/griffin_api/uas/models/IUAS';

import { mockIUasOut, mockUasData } from './mock_data';

export const uacHandlers = [
  /* Intercept "GET" get user by ID */
  http.get(`${UAS_BASE_URL}/uac`, ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    // Simulate user not found
    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    // Simulate server error
    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Return mock user for valid IDs
    return HttpResponse.json<Array<IUasDto>>(mockUasData);
  }),
  http.put(`${UAS_BASE_URL}/uac/:id`, async ({ request }) => {
    const body = (await request.json()) as any;

    if (!body) {
      return HttpResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
    return HttpResponse.json<IUasOut>(mockIUasOut);
  }),
];
