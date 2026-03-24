import { http, HttpResponse } from 'msw';

import { IUnitBriefDto } from '@store/amap_ai/units/models';
import { unitsBaseUrl } from '@store/amap_ai/units/slices/unitsApiSlice';

import { mockTestUnit } from './mock_data';

export const unitHandlers = [
  /* Intercept "GET" all units */
  http.get(`${unitsBaseUrl}`, () => {
    return HttpResponse.json<Array<IUnitBriefDto>>([mockTestUnit]);
  }),

  /* Intercept "GET" units by UIC */
  http.get(`${unitsBaseUrl}`, ({ request }) => {
    // Construct a URL instance out of the intercepted request.
    const url = new URL(request.url);

    // Read the "id" URL query parameter using the "URLSearchParams" API.
    // Given "/units?uic=1", "uic" will equal "1".
    const unitUic = url.searchParams.get('uic');

    // Note that query parameters are potentially undefined.
    // Make sure to account for that in your handlers.
    if (!unitUic) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json<Array<IUnitBriefDto>>([mockTestUnit]);
  }),
];
