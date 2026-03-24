import { http, HttpResponse } from 'msw';

import { counselingsBaseUrl, IDA4856DTO } from '@store/amap_ai/counselings';

import { mockDA4856s, mockPDF } from './mock_data';

/**
 * Handlers for supporting documents API endpoints.
 */
export const councelingHandlers = [
  // Handler for fetching all councelings
  http.get(`${counselingsBaseUrl}/soldier/:soldier_id`, () => {
    return HttpResponse.json<IDA4856DTO[]>(mockDA4856s, { status: 200 });
  }),

  // Handel for adding a new document
  http.post(`${counselingsBaseUrl}/soldier/:soldier_id`, () => {
    return HttpResponse.json<{ message: string }>({ message: 'Success' }, { status: 200 });
  }),

  // Handler for updating a counseling
  http.get(`${counselingsBaseUrl}/:counseling_id`, () => {
    return HttpResponse.json<{ message: string; success: boolean }>(
      { message: 'Success', success: true },
      { status: 200 },
    );
  }),
  http.get(`${counselingsBaseUrl}/soldier/:soldier_id/document/:da_4856_id`, () => {
    return new HttpResponse(mockPDF, { status: 200 });
  }),
];
