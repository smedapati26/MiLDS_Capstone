import { http, HttpResponse } from 'msw';

import { mockFaultOverTime } from './mock_data';

/**
 * An array of request handlers for faults-related API endpoints.
 */
export const faultOverTimeHandlers = [
  http.get('*/faults/faults-over-time', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');
    const start_date = url.searchParams.get('start_date');
    const end_date = url.searchParams.get('end_date');

    // Simulate uic not found
    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    // Simulate start_date not found
    if (!start_date || start_date === 'not-found') {
      return HttpResponse.json({ error: 'Start Date not found' }, { status: 404 });
    }

    // Simulate end_date not found
    if (!end_date || end_date === 'not-found') {
      return HttpResponse.json({ error: 'End Date not found' }, { status: 404 });
    }

    // Simulate server error
    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json([mockFaultOverTime]);
  }),
];
