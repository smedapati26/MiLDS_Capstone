/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse } from 'msw';

import {
  IAggregateConditionDto,
  IAGSEEditOutDto,
  IAGSEOutDto,
  IAGSESubordinateDto,
} from '@store/griffin_api/agse/models';
import { AGSE_BASE_URL } from '@store/griffin_api/base_urls';

import { mockAggregateConditionDto, mockAGSEDto, mockAGSEEditOutDto, mockAGSESubordinateDto } from './mock_data';

/**
 * An array of request handlers for agse-related API endpoints.
 */
export const agseHandlers = [
  // GET /agse/agse?uic=${uic}
  http.get(`${AGSE_BASE_URL}/agse`, ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json<IAGSEOutDto>(mockAGSEDto);
  }),
  http.get(`${AGSE_BASE_URL}/agse-subordinate`, ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');
    if (!uic) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json<Array<IAGSESubordinateDto>>(mockAGSESubordinateDto);
  }),
  http.get(`${AGSE_BASE_URL}/aggregate-condition`, ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json<Array<IAggregateConditionDto>>(mockAggregateConditionDto);
  }),
  http.patch(`${AGSE_BASE_URL}/edit`, async ({ request }) => {
    const body = (await request.json()) as any;

    if (!body) {
      return HttpResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    return HttpResponse.json<IAGSEEditOutDto>(mockAGSEEditOutDto);
  }),
];
