import { http, HttpResponse } from 'msw';

import { IUnitHealthDataDTO, unitHealthApiBaseUrl } from '@store/amap_ai/unit_health';

import { mockUnitHealthData } from './mock_data';

export const unitHealthDataSummaryDataHandlers = [
  // Handler for getting a unit's evaluation data
  http.get(`${unitHealthApiBaseUrl}/unit/:unit_uic/health_summary`, () => {
    return HttpResponse.json<IUnitHealthDataDTO>(mockUnitHealthData, { status: 200 });
  }),
];
