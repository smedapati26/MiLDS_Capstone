/* eslint-disable @typescript-eslint/ban-ts-comment */
import { http, HttpResponse } from 'msw';

import { soldierApiBaseUrl } from '@store/amap_ai/soldier/slices/soldierApi';

import { mockUnitSoldiersData } from './mock_data';

/**
 * An array of request handlers for soldier-related API endpoints.
 */
export const soldierApiHandlers = [
  // Intercept "GET" unit soldiers data by UIC and type
  http.get(`${soldierApiBaseUrl}/unit/:uic/soldiers/:type`, (req) => {
    const { uic, type } = req.params;

    const unitSoldiers = mockUnitSoldiersData[uic as string]?.[type as string];
    if (!unitSoldiers) {
      return HttpResponse.json({ error: 'Unit soldiers not found' }, { status: 404 });
    }

    return HttpResponse.json({ soldiers: unitSoldiers });
  }),

  // Intercept "PATCH" update soldier
  http.patch(`${soldierApiBaseUrl}/:user_id/update`, async (req) => {
    const { user_id } = req.params;
    const body = await req;

    if (!mockUnitSoldiersData[user_id as string]) {
      return HttpResponse.json({ error: 'Soldier not found' }, { status: 404 });
    }

    // @ts-expect-error
    mockUnitSoldiersData[user_id as string] = {
      ...mockUnitSoldiersData[user_id as string],
      ...body,
    };

    return HttpResponse.json({ user_id, success: true });
  }),
];
