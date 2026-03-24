import { http, HttpResponse } from 'msw';

import { IAdjudicateTransferRequestPayload, IAdjudicateTransferRequestResponse } from '@store/griffin_api/auto_dsr/models/ITransferRequestAdjudication';

import {
  mockAcdHistory,
  mockAutoDsrDto,
  mockAutoDsrLocationDto,
  mockAutoDsrSingleUnitInfoDto,
  mockBankTimeProjectionDto,
  mockEquipmentTransferRequests,
  mockFlyingHoursDto,
  mockLatestHistory,
  mockSimilarUnitsResponse,
  mockUnitBriefDto,
} from './mock_data';

/**
 * An array of request handlers for auto-dsr-related API endpoints.
 */
export const autoDsrHandlers = [
  // GET /auto_dsr?uic=${uic}
  http.get('*/auto_dsr', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json([mockAutoDsrDto]);
  }),

  // GET /bank-time-forecast?uic=${uic}
  http.get('*/auto_dsr/bank-time-forecast', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json(mockBankTimeProjectionDto);
  }),

  // GET /flying-hours?uic=${uic}
  http.get('*/auto_dsr/flying-hours', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json(mockFlyingHoursDto);
  }),

  // GET /unit (getSimilarUnits)
  http.get('*/auto_dsr/unit', ({ request }) => {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);

    // If has params other than top_level_uic, assume getSimilarUnits
    const hasSimilarParams = Object.keys(params).some((key) => key !== 'top_level_uic');

    if (hasSimilarParams) {
      if (params.uic === 'not-found') {
        return HttpResponse.json({ error: 'Unit not found' }, { status: 404 });
      }
      if (params.uic === 'server-error') {
        return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
      return HttpResponse.json([mockSimilarUnitsResponse]);
    }

    // Else, getUnits
    const topLevelUic = url.searchParams.get('top_level_uic');
    if (topLevelUic === 'not-found') {
      return HttpResponse.json({ error: 'Top level UIC not found' }, { status: 404 });
    }
    if (topLevelUic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    return HttpResponse.json([mockUnitBriefDto]);
  }),

  /// GET /unit/:uic (single unit info)
  http.get('*/auto_dsr/unit/:uic', ({ params }) => {
    const { uic } = params;

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'Unit not found' }, { status: 404 });
    }
    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    if (uic === 'empty-similar-units') {
      return HttpResponse.json({
        ...mockAutoDsrSingleUnitInfoDto,
        similar_units: [],
      });
    }

    return HttpResponse.json(mockAutoDsrSingleUnitInfoDto);
  }),

  http.get('*/auto_dsr/models/location', ({ request }) => {
    const url = new URL(request.url);

    const name = url.searchParams.get('name');
    const code = url.searchParams.get('code');

    if (!name || name === 'not-found') {
      return HttpResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    if (name === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    if (name === 'empty' || code === 'empty') {
      return HttpResponse.json({ items: [] });
    }

    if (!name) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({ items: mockAutoDsrLocationDto });
  }),

  http.post('*/auto_dsr/object-transfer-request', ({ request }) => {
    if (request) {
      return HttpResponse.json({ success: true, ids: [], message: 'Aircraft request was successfully adjudicated.' });
    }

    return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
  }),

  // GET /acd/history
  http.get('*/auto_dsr/acd/history', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('unit');
    const search = url.searchParams.get('search');

    if (uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }
    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Filter by search if provided
    if (search) {
      mockAcdHistory.items = mockAcdHistory.items.filter(
        (item) =>
          item.file_name.toLowerCase().includes(search.toLowerCase()) ||
          `${item.user.first_name} ${item.user.last_name}`.toLowerCase().includes(search.toLowerCase()),
      );
      mockAcdHistory.total = mockAcdHistory.items.length;
    }

    return HttpResponse.json(mockAcdHistory);
  }),

  // GET /acd/latest_history
  http.get('*/auto_dsr/acd/latest_history', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('unit');

    if (uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }
    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json(mockLatestHistory);
  }),

  // POST /acd/upload
  http.post('*/auto_dsr/acd/upload', async ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }
    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json({
      message: 'ACD file uploaded successfully',
      export_id: 12345,
    });
  }),

  // PUT /acd/cancel/:id
  http.put('*/auto_dsr/acd/cancel/:id', ({ params }) => {
    const { id } = params;

    if (id === 'not-found') {
      return HttpResponse.json({ error: 'Upload not found' }, { status: 404 });
    }
    if (id === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json({
      message: 'ACD upload cancelled successfully',
    });
  }),

  // GET /acd/download/:id
  http.get('*/auto_dsr/acd/download/:id', async ({ params }) => {
    const { id } = params;

    // Convert id to string for comparison
    const idStr = String(id);

    if (idStr === 'not-found' || Number(id) === 999999 || idStr === '999999') {
      return HttpResponse.json({ error: 'File not found' }, { status: 404 });
    }
    if (idStr === 'server-error' || Number(id) === -1 || idStr === '-1') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Create a mock text file content
    const mockFileContent = `ACD File Content for ID: ${id}\nThis is a mock ACD file.\nLine 3\nLine 4`;

    // Convert string to ArrayBuffer
    const encoder = new TextEncoder();
    const arrayBuffer = encoder.encode(mockFileContent).buffer;

    return HttpResponse.arrayBuffer(arrayBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="acd-file-${id}.txt"`,
      },
    });
  }),
  http.get('*/auto_dsr/object-transfer-request', ({ request }) => {
    if (request) {
      return HttpResponse.json(mockEquipmentTransferRequests);
    }
    
    return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
  }),

  http.post(`*/auto_dsr/adjudicate-object-transfer-request`, async ({ request }) => {
      const body = (await request.json()) as IAdjudicateTransferRequestPayload;

      if (request ) {
        return HttpResponse.json<IAdjudicateTransferRequestResponse>({
          user_permission: [],
          adjudicated: body ? body.transfer_request_ids as unknown as string[] : [],
          partial: [],
        });
      }
  
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }),
];
