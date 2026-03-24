/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse } from 'msw';

import { mockMaintenanceLaneDto } from './mock_data';

/**
 * An array of request handlers for lanes-related API endpoints.
 */
export const lanesHandlers = [
  // GET /maintenance-lanes?uic=${uic}
  http.get('*/events/maintenance-lanes', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json({ items: [mockMaintenanceLaneDto] });
  }),

  // POST /maintenance-lane
  http.post('*/events/maintenance-lane', async ({ request }) => {
    const body = (await request.json()) as any;

    if (!body || !body.name) {
      return HttpResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    return HttpResponse.json({ ...mockMaintenanceLaneDto, ...body, id: 2 });
  }),

  // DELETE /maintenance-lane/${id}
  http.delete('*/events/maintenance-lane/:id', ({ params }) => {
    const { id } = params;

    if (id === 'not-found') {
      return HttpResponse.json({ error: 'Lane not found' }, { status: 404 });
    }

    if (id === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json({ success: true });
  }),

  // PUT /maintenance-lane/${id}
  http.put('*/events/maintenance-lane/:id', async ({ request, params }) => {
    const { id } = params;
    const body = (await request.json()) as any;

    if (id === 'not-found') {
      return HttpResponse.json({ error: 'Lane not found' }, { status: 404 });
    }

    if (id === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json({ ...mockMaintenanceLaneDto, ...body, id: Number(id) });
  }),
];
