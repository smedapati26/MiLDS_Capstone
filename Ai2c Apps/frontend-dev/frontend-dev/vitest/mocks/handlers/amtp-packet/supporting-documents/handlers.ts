import { http, HttpResponse } from 'msw';

import { supportingDocumentBaseUrl, SupportingDocumentDTO } from '@store/amap_ai/supporting_documents';

import { mockSupportingDocuments, mockSupportingDocumentTypes } from './mock_data';

/**
 * Handlers for supporting documents API endpoints.
 */
export const supportingDocumentHandlers = [
  // Handler for fetching all supporting documents
  http.get(`${supportingDocumentBaseUrl}/soldier/:soldier_id`, () => {
    return HttpResponse.json<SupportingDocumentDTO[]>(mockSupportingDocuments, { status: 200 });
  }),

  // Handel for adding a new document
  http.post(`${supportingDocumentBaseUrl}/soldier/:soldier_id`, () => {
    return HttpResponse.json<{ message: string }>({ message: 'Success' }, { status: 200 });
  }),

  // Handler for fetching document types
  http.get(`${supportingDocumentBaseUrl}/types`, () => {
    return HttpResponse.json<{ id: number; type: string }[]>(mockSupportingDocumentTypes, { status: 200 });
  }),
];
