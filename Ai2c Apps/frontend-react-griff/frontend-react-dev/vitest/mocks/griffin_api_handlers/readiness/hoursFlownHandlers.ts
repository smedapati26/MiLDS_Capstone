import { http, HttpResponse } from 'msw';

import { IHoursFlownUnits } from '@store/griffin_api/readiness/models';

import { mockHoursFlownModel, mockHoursFlownSubordinate, mockHoursFlownUnit } from './mock_data/hours_flown_mock_data';

export const hoursFlownHandlers = [
  /* Intercept "GET" for Hours Flown by Unit */
  http.get('*/readiness/hours-flown-unit', ({ request }) => {
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

    return HttpResponse.json<Array<IHoursFlownUnits>>([mockHoursFlownUnit]);
  }),

  /* Intercept "GET" for Hours Flown by Subordinates */
  http.get('*/readiness/hours-flown-subordinate', ({ request }) => {
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

    return HttpResponse.json([mockHoursFlownSubordinate]);
  }),

  /* Intercept "GET" for Hours Flown by Models */
  http.get('*/readiness/hours-flown-model', ({ request }) => {
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

    return HttpResponse.json([mockHoursFlownModel]);
  }),
];
