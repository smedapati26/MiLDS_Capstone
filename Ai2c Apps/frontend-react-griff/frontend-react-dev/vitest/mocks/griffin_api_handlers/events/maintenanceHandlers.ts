/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse } from 'msw';

import { mockMaintenanceCountsData, mockMaintenanceEventDto, mockUpcomingMaintenanceDto } from './mock_data';

/**
 * An array of request handlers for maintenance-related API endpoints.
 */
export const maintenanceHandlers = [
  // GET /maintenance-counts?uic=${uic}&start_date=${start_date}&end_date=${end_date}
  http.get('*/events/maintenance-counts', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json(mockMaintenanceCountsData);
  }),

  // GET /maintenance?uic=${uic}&begin_date=${begin_date}&end_date=${end_date}
  http.get('*/events/maintenance', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json({ items: [mockMaintenanceEventDto] });
  }),

  // GET /maintenance/${eventId}
  http.get('*/events/maintenance/:eventId', ({ params }) => {
    const { eventId } = params;

    if (eventId === 'not-found') {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (eventId === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json(mockMaintenanceEventDto);
  }),

  // GET /upcoming-maintenance
  http.get('*/events/upcoming-maintenance', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json([mockUpcomingMaintenanceDto]);
  }),

  // POST /maintenance
  http.post('*/events/maintenance', async ({ request }) => {
    const body = (await request.json()) as any;

    if (!body || !body.aircraft_id) {
      return HttpResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    return HttpResponse.json({ id: 2 });
  }),

  // PUT /maintenance/${id}
  http.put('*/events/maintenance/:id', async ({ params }) => {
    const { id } = params;

    if (id === 'not-found') {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (id === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json({});
  }),

  // DELETE /maintenance/${id}
  http.delete('*/events/maintenance/:id', ({ params }) => {
    const { id } = params;

    if (id === 'not-found') {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (id === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json({});
  }),
];
