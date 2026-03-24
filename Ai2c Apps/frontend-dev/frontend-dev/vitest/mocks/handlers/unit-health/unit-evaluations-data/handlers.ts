import { http, HttpResponse } from 'msw';

import { IUnitEvaluationsSoldierDataDTO, unitHealthApiBaseUrl } from '@store/amap_ai/unit_health';

import { mockUnitEvaluationsSoldierData } from './mock_data';

export const unitEvaluationsDataHandlers = [
  // Handler for getting a unit's evaluation data
  http.get(`${unitHealthApiBaseUrl}/unit/:unit_uic/evaluation_details`, () => {
    return HttpResponse.json<IUnitEvaluationsSoldierDataDTO[]>(mockUnitEvaluationsSoldierData, { status: 200 });
  }),
];
