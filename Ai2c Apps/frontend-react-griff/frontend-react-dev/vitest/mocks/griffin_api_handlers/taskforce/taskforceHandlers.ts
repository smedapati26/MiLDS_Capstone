import { http, HttpResponse } from 'msw';

import { ITaskForceSimpleDto } from '@store/griffin_api/taskforce/models/ITaskforce';
import { IUserEquipmentsDto } from '@store/griffin_api/taskforce/models/IUserEquipment';

import { mockUserEquipment } from './mock_data';

export const taskforceHandlers = [
  /* Intercept "GET" get for user equipment */
  http.get(`*/task_force/user-equipment`, () => {
    return HttpResponse.json<IUserEquipmentsDto>(mockUserEquipment);
  }),

  /* Intercept POST for create taskforce */
  http.post('*/task_force', async ({ request }) => {
    const body = await request.json();

    if (!body || typeof body !== 'object') {
      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Simulate server error for specific test case
    if (body.name === 'error-test') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json<string>('TASKFORCE_CREATED');
  }),
  
  /* Intercept "GET" get for taskforces */
  http.get(`*/task_force`, () => {
    return HttpResponse.json<Array<ITaskForceSimpleDto>>([]);
  }),

  /* Intercept "DELETE" for delete taskforce */
  http.delete('*/task_force/:uic', ({ params }) => {
    const { uic } = params;

    if (!uic) {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json({ success: true });
  }),

];
