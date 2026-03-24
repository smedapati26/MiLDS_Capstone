import { http, HttpResponse } from 'msw';

import { ISoldierFlagDTO, soldierFlagBaseUrl } from '@store/amap_ai/soldier_flag';

import { mockSoldierFlags } from './mock_data';

/**
 * Handlers for soldier flags API endpoints.
 */
export const soldierFlagHandlers = [
  // Handler for fetching all soldierFlags
  http.get(`${soldierFlagBaseUrl}/soldier/:soldier_id`, () => {
    return HttpResponse.json<ISoldierFlagDTO[]>(mockSoldierFlags, { status: 200 });
  }),
  // Handler for creating a Soldier Flag
  http.get('/', () => {
    return HttpResponse.json({ message: 'Success' });
  }),
  // Handler for updating a Soldier Flag
  http.put(`${soldierFlagBaseUrl}:/soldier_flag_id`, () => {
    return HttpResponse.json({ message: 'Success' });
  }),
];
