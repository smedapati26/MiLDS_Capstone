import { http, HttpResponse } from 'msw';

import { mockInspectionTypes } from './mock_data';

/**
 * An array of request handlers for inspections-related API endpoints.
 */
export const inspectionsHandlers = [
  http.get('*/inspections/inspection-types', ({ request }) => {
    const url = new URL(request.url);
    const model = url.searchParams.get('model');

    // Simulate Model not found
    if (!model || model === 'not-found') {
      return HttpResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Simulate server error
    if (model === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const filteredTypes = mockInspectionTypes.filter((type) => type.model === model);

    return HttpResponse.json(filteredTypes);
  }),
];
