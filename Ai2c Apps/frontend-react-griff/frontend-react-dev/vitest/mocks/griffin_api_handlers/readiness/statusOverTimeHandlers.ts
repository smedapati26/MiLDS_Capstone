import { http, HttpResponse } from 'msw';

import { IStatusOverTimeDto } from '@store/griffin_api/readiness/models';

import { statusOverTimeMockData } from './mock_data/status_over_time_mock_data';

export const statusOverTimeHandlers = [
  /* Intercept "GET" for Hours Flown by Unit */
  http.get('*/readiness/status-over-time', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    // Simulate UIC not found
    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    // Simulate server error
    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Return resource payload
    return HttpResponse.json<Array<IStatusOverTimeDto>>([statusOverTimeMockData]);
  }),
];
