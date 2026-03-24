import { http, HttpResponse } from 'msw';

import { IUnitRosterDTO, unitHealthApiBaseUrl } from '@store/amap_ai/unit_health';

import { mockUnitRosterData } from './mock_data';

export const unitRosterDataHandlers = [
  // Handler for getting a unit's roster data
  http.get(`${unitHealthApiBaseUrl}/unit/:unit_uic/health_roster`, () => {
    return HttpResponse.json<IUnitRosterDTO[]>(mockUnitRosterData, { status: 200 });
  }),
];
