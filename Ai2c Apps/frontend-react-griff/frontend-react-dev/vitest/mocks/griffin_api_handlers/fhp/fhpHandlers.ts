import { http, HttpResponse } from 'msw';

import { mockFhpProgressDto, mockFhpProgressMultiDtoArray, mockFhpSummaryDto } from './mock_data';

export const fhpHandlers = [
  // GET /flight-hours-summary
  http.get(/\/flight-hours-summary$/, ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }
    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json(mockFhpSummaryDto);
  }),

  // GET /fhp-progress
  http.get(/\/fhp-progress$/, ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }
    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json(mockFhpProgressDto);
  }),

  // GET /fhp-progress-multiple-units
  http.get(/\/fhp-progress-multiple-units$/, ({ request }) => {
    const url = new URL(request.url);
    const similarUnits = url.searchParams.getAll('similar_units');

    if (!similarUnits.length || similarUnits.includes('not-found')) {
      return HttpResponse.json({ error: 'Units not found' }, { status: 404 });
    }
    if (similarUnits.includes('server-error')) {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // You can filter mockFhpProgressMultiDtoArray by similarUnits if you want
    return HttpResponse.json(mockFhpProgressMultiDtoArray);
  }),
];
