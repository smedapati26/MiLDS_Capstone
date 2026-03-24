import { http, HttpResponse } from 'msw';

import { MODS_BASE_URL } from '@store/griffin_api/base_urls';
import { IModificationEditOutDto } from '@store/griffin_api/mods/models';

import { mockModificationEditOutDto, mockModificationModels, mockModificationsDto, mockModsDto } from './mock_data';

export const modsHandlers = [
  http.get(`${MODS_BASE_URL}/selected/:uic`, ({ request }) => {
    const uic = request.url.substring(request.url.lastIndexOf('/') + 1);
    if (uic) {
      if (uic === 'not-found') {
        return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
      }
    }
    return HttpResponse.json(mockModsDto);
  }),
  http.get(`${MODS_BASE_URL}/types`, () => {
    return HttpResponse.json(mockModificationModels);
  }),
  http.get(`${MODS_BASE_URL}/:uic`, ({ request }) => {
    const uic = request.url.substring(request.url.lastIndexOf('/') + 1);
    if (uic) {
      if (uic === 'not-found') {
        return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
      }
    }
    return HttpResponse.json(mockModificationsDto);
  }),
  http.post(`${MODS_BASE_URL}`, async ({ request }) => {
    const body = (await request.json()) as unknown;

    if (!body) {
      return HttpResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    return HttpResponse.json({"success": true});
  }),
  http.delete(`${MODS_BASE_URL}`, async ({ request }) => {    
    const url = new URL(request.url);
    const mod_id = url.searchParams.get('mod_id');

    if (!mod_id) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({"success": true}, {status: 200});
  }),
  http.patch(`${MODS_BASE_URL}`, async ({ request }) => {
    const body = (await request.json()) as unknown;

    if (!body) {
      return HttpResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    return HttpResponse.json<IModificationEditOutDto>(mockModificationEditOutDto);
  }),
];
