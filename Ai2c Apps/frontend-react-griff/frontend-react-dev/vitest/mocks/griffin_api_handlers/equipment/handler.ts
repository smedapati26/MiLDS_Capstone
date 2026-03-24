import { http, HttpResponse } from 'msw';

import { EQUIPMENT_BASE_URL } from '@store/griffin_api/base_urls';
import { IAircraftModelStatusDto } from '@store/griffin_api/equipment/models/IEquipment';

import { mockAircraftModelStatusDto } from './mock_data';

export const equipmentManagerHandlers = [
  http.get(`${EQUIPMENT_BASE_URL}/aircraft-model-status`, ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    if (!uic) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json<Array<IAircraftModelStatusDto>>(mockAircraftModelStatusDto);
  }),
];
