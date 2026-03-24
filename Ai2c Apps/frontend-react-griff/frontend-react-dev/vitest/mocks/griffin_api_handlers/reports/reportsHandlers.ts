import { http, HttpResponse } from 'msw';

import { REPORTS_BASE_URL } from '@store/griffin_api/base_urls';

/**
 * An array of request handlers for reports-related API endpoints.
 */
export const reportsHandlers = [
  // POST /reports/dsr/create/${uic}
  http.post(`${REPORTS_BASE_URL}/dsr/create/:uic`, ({ params }) => {
    const { uic } = params;
    if (!uic) {
      return new HttpResponse(null, { status: 404 });
    }
    // Mock a blob response for PDF export
    const mockBlob = new Blob(['mock pdf content'], { type: 'application/pdf' });
    return new HttpResponse(mockBlob, {
      status: 200,
      headers: { 'Content-Type': 'application/pdf' },
    });
  }),
  // GET /reports/dsr/csv/${uic}
  http.get(`${REPORTS_BASE_URL}/dsr/csv/:uic`, ({ params }) => {
    const { uic } = params;
    if (!uic) {
      return new HttpResponse(null, { status: 404 });
    }
    // Mock a zip blob response for CSV export
    const mockBlob = new Blob(['mock zip content'], { type: 'application/zip' });
    return new HttpResponse(mockBlob, {
      status: 200,
      headers: { 'Content-Type': 'application/zip' },
    });
  }),
];
