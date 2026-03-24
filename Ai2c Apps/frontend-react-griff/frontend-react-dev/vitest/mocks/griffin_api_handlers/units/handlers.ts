import { http, HttpResponse } from 'msw';

import { IUnitBriefDto } from '@store/griffin_api/auto_dsr/models';

import { mockTestUnitDto } from './mock_data';

export const unitHandlers = [
  /* Intercept "GET" all units */
  http.get('*/users', () => {
    return HttpResponse.json<Array<IUnitBriefDto>>([mockTestUnitDto]);
  }),

  /* Intercept "GET" units by UIC */
  http.get('*/users', ({ request }) => {
    // Construct a URL instance out of the intercepted request.
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');
    const start_date = url.searchParams.get('start_date');
    const end_date = url.searchParams.get('end_date');

    // Simulate uic not found
    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    // Simulate server error
    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Simulate start_date not found
    if (!start_date || start_date === 'not-found') {
      return HttpResponse.json({ error: 'Start Date not found' }, { status: 404 });
    }

    // Simulate end_date not found
    if (!end_date || end_date === 'not-found') {
      return HttpResponse.json({ error: 'End Date not found' }, { status: 404 });
    }

    return HttpResponse.json<Array<IUnitBriefDto>>([mockTestUnitDto]);
  }),
];
