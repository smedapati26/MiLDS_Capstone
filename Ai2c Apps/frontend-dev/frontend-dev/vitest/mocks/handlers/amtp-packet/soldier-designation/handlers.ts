import { http, HttpResponse } from 'msw';

import { designationBaseUrl } from '@store/amap_ai/designation';
import { ISoldierDesignationDTO } from '@store/amap_ai/designation/models';

import { mockSoldierDesignations } from './mock_data';

/**
 * Handlers for soldier designation api endpoints.
 */
export const soldierDesignationHandlers = [
  // Handler for getting all soldier designations
  http.get(`${designationBaseUrl}/soldier/:user_id`, () => {
    return HttpResponse.json<ISoldierDesignationDTO[]>(mockSoldierDesignations, { status: 200 });
  }),
];
