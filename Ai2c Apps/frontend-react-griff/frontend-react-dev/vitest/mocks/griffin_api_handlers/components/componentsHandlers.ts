import { http, HttpResponse } from 'msw';

import {
  mockAircraftRiskPrediction,
  mockComponentRiskPrediction,
  mockFailureCountDto,
  mockFailurePredictionDto,
  mockLongevity,
  mockPartListItem,
  mockShortLifeComponentDto,
  mockSurvivalPredictionDto,
} from './mock_data';

/**
 * An array of request handlers for components-related API endpoints.
 */
export const componentsHandlers = [
  // GET /full-short-life?uic=${uic}&include_na=${include_na}
  http.get('*/components/full-short-life', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json([mockShortLifeComponentDto]);
  }),

  // GET /failure-count?uic=${uic}&hour=${hour}&failure_percentage=${failure_percentage}
  http.get('*/components/failure-count', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json([mockFailureCountDto]);
  }),

  // GET /comp-checklist-export
  http.get('*/components/comp-checklist-export', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Return a mock file download response
    return HttpResponse.json({ message: 'Export successful' });
  }),

  // GET /surv-preds?uic=${uic}
  http.get('*/components/surv-preds', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json({ items: [mockSurvivalPredictionDto] });
  }),

  // GET /failure-preds?horizon=${horizon}&aircraft=${aircraft}
  http.get('*/components/failure-preds', ({ request }) => {
    const url = new URL(request.url);
    const horizon = url.searchParams.get('horizon');
    const aircraft = url.searchParams.getAll('aircraft');

    if (!horizon || horizon === 'invalid') {
      return HttpResponse.json({ error: 'Invalid horizon parameter' }, { status: 400 });
    }

    if (horizon === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Check if this is for component failure predictions (has aircraft param) or regular failure predictions
    // getComponentFailurePredictions sends aircraft as array, getFailurePredictions sends aircraft as string array
    if (aircraft.length > 0) {
      return HttpResponse.json([mockComponentRiskPrediction]);
    } else {
      return HttpResponse.json({ items: [mockFailurePredictionDto] });
    }
  }),

  // GET /aircraft-risk?uic=${uic}&variant=${variant}&serial_numbers=${serial_numbers}&other_uics=${other_uics}&part_numbers=${part_numbers}
  http.get('*/components/aircraft-risk', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json([mockAircraftRiskPrediction]);
  }),

  // GET /part-list?uic=${uic}&serial=${serial}
  http.get('*/components/part-list', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json([{ part_number: mockPartListItem.part_number, models: mockPartListItem.models }]);
  }),

  // GET /component-risk?uic=${uic}&variant=${variant}&serial_numbers=${serial_numbers}&part_numbers=${part_numbers}&other_uics=${other_uics}&serial=${serial}
  http.get('*/components/component-risk', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json([mockComponentRiskPrediction]);
  }),

  // GET /model-risk?uic=${uic}&part_number=${part_number}
  http.get('*/components/model-risk', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');
    const partNumber = url.searchParams.get('part_number');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (!partNumber || partNumber === 'not-found') {
      return HttpResponse.json({ error: 'Part number not found' }, { status: 404 });
    }

    if (uic === 'server-error' || partNumber === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json([mockAircraftRiskPrediction]);
  }),

  // GET /longevity?uic=${uic}&part_number=${part_number}
  http.get('*/components/longevity', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');
    const partNumber = url.searchParams.get('part_number');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (!partNumber || partNumber === 'not-found') {
      return HttpResponse.json({ error: 'Part number not found' }, { status: 404 });
    }

    if (uic === 'server-error' || partNumber === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json(mockLongevity);
  }),
];
