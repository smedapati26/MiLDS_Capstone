import { http, HttpResponse } from 'msw';

import { IUnitAvailabilityDataDTO, unitHealthApiBaseUrl } from '@store/amap_ai/unit_health';

import { mockUnitAvailabilityData } from './mock_data';

export const unitAvailabilityDataHandlers = [
  // Handler for getting a unit's availability data
  http.get(`${unitHealthApiBaseUrl}/unit/:unit_uic/availability_details`, () => {
    return HttpResponse.json<IUnitAvailabilityDataDTO[]>(mockUnitAvailabilityData, { status: 200 });
  }),
];
