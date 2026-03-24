/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse } from 'msw';

import { IAircraftEditOutDto, IAircraftEquipmentDetailsDto } from '@store/griffin_api/aircraft/models';
import { AIRCRAFT_BASE_URL } from '@store/griffin_api/base_urls';

import {
  mockAircraftBankPercentageDto,
  mockAircraftCompanyDto,
  mockAircraftDsrDto,
  mockAircraftDto,
  mockAircraftEditOutDto,
  mockAircraftEquipmentDetailsDto,
  mockAircraftPhaseFlowDto,
  mockAircraftPhaseFlowModelsDto,
  mockAircraftPhaseFlowSubordinatesDto,
  mockModificationAndKits,
} from './mock_data';

/**
 * An array of request handlers for aircraft-related API endpoints.
 */
export const aircraftHandlers = [
  // GET /aircraft?serial=${serial}
  http.get(AIRCRAFT_BASE_URL, ({ request }) => {
    const url = new URL(request.url);
    const serial = url.searchParams.get('serial');

    if (serial) {
      if (serial === 'not-found') {
        return HttpResponse.json({ error: 'Serial not found' }, { status: 404 });
      }

      if (serial === 'server-error') {
        return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
      }

      return HttpResponse.json({ items: [mockAircraftDto] });
    }

    // For UIC queries
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json({ items: [mockAircraftDto] });
  }),

  // GET /aircraft/phase-flow?uic=${uic}&models=${models}
  http.get('*/aircraft/phase-flow', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json([mockAircraftPhaseFlowDto]);
  }),

  // GET /aircraft/phase-flow-subordinates?uic=${uic}&models=${models}
  http.get('*/aircraft/phase-flow-subordinates', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json([mockAircraftPhaseFlowSubordinatesDto]);
  }),

  // GET /aircraft/phase-flow-models?uic=${uic}&models=${models}
  http.get('*/aircraft/phase-flow-models', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json([mockAircraftPhaseFlowModelsDto]);
  }),

  // GET /aircraft/bank-hour-percentage?uic=${uic}&return_by=${returnBy}
  http.get('*/aircraft/bank-hour-percentage', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json([mockAircraftBankPercentageDto]);
  }),

  // GET /aircraft/companies?uic=${uic}&aircraft=${aircraftFamily}&models=${models}
  http.get('*/aircraft/companies', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json([mockAircraftCompanyDto]);
  }),

  // GET /aircraft/dsr?uic=${uic}&serials=${serials}
  http.get('*/aircraft/dsr', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json(mockAircraftDsrDto);
  }),

  http.get(`${AIRCRAFT_BASE_URL}/details`, ({ request }) => {
    // Construct a URL instance out of the intercepted request.
    const url = new URL(request.url);

    const uic = url.searchParams.get('uic');

    if (!uic) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json<Array<IAircraftEquipmentDetailsDto>>(mockAircraftEquipmentDetailsDto);
  }),
  http.patch(`${AIRCRAFT_BASE_URL}/edit`, async ({ request }) => {
    const body = (await request.json()) as any;

    if (!body) {
      return HttpResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    return HttpResponse.json<IAircraftEditOutDto>(mockAircraftEditOutDto);
  }),

  http.get(`${AIRCRAFT_BASE_URL}/mods_kits`, ({ request }) => {
    const url = new URL(request.url);

    const serial = url.searchParams.get('serial');

    if (!serial) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({ items: mockModificationAndKits });
  }),
];
