import { http, HttpResponse } from 'msw';

import { IUnitMissingPacketsSoldierDataDTO, unitHealthApiBaseUrl } from '@store/amap_ai/unit_health';

import { mockUnitMissingPacketsData } from './mock_data';

export const unitMissingPacketsDataHandlers = [
  // Handler for getting a unit's missing packet data
  http.get(`${unitHealthApiBaseUrl}/unit/:unit_uic/evaluation_details`, () => {
    return HttpResponse.json<IUnitMissingPacketsSoldierDataDTO[]>(mockUnitMissingPacketsData, { status: 200 });
  }),
];
