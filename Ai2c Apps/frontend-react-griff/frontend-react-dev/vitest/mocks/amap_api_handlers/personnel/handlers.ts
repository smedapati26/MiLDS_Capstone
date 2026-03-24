import { http, HttpResponse } from 'msw';

import { IMaintainerDto } from '@store/amap_api/personnel/models/IMaintainer';
import {
  IMaintainerExperienceMos,
  IMaintainerStrengthMosAvailability,
} from '@store/amap_api/personnel/models/IMaintainerExperience';
import { IMaintenancePersonnelCount } from '@store/amap_api/personnel/models/IMaintenancePersonnelCount';
import { IPhaseTeamDto } from '@store/amap_api/personnel/models/IPhaseTeam';

import {
  mockMaintainerDtoList,
  mockMaintainerExperienceMosList,
  mockMaintainerStrengthMosAvailabilityList,
  mockMaintenancePersonnelCount,
  mockPhaseTeamDto,
} from './mock_data';

export const personnelHandlers = [
  /* Intercept "GET" get UIC elevated roles */
  http.get('*/personnel/readiness/unit', ({ params }) => {
    const { uic } = params;

    // Simulate UIC not found
    if (uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    // Simulate server error
    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json<IMaintenancePersonnelCount[]>([mockMaintenancePersonnelCount]);
  }),
  /* Intercept "GET" get inexperienced personnel */
  http.get('*/personnel/readiness/unit/inexperienced', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');
    const start_date = url.searchParams.get('start_date');
    const end_date = url.searchParams.get('end_date');

    // Simulate UIC not found
    if (uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    // Simulate server error
    if (uic === 'server-error' || start_date === 'server-error' || end_date === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Simulate no data
    if (uic === 'no-data') {
      return HttpResponse.json<IMaintenancePersonnelCount[]>([]);
    }

    return HttpResponse.json<IMaintenancePersonnelCount[]>([mockMaintenancePersonnelCount]);
  }),
  /* Intercept "GET" maintainer experience by MOS */
  http.get('*/personnel/readiness/unit/maintainer_experience_by_mos', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    // Simulate UIC not found
    if (uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    // Simulate server error
    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Simulate no data
    if (uic === 'no-data') {
      return HttpResponse.json<IMaintainerExperienceMos[]>([]);
    }

    return HttpResponse.json<IMaintainerExperienceMos[]>(mockMaintainerExperienceMosList);
  }),
  /* Intercept "GET" strength by MOS */
  http.get('*/personnel/readiness/unit/strength_by_mos', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    // Simulate UIC not found
    if (uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    // Simulate server error
    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Simulate no data
    if (uic === 'no-data') {
      return HttpResponse.json<IMaintainerStrengthMosAvailability[]>([]);
    }

    return HttpResponse.json<IMaintainerStrengthMosAvailability[]>(mockMaintainerStrengthMosAvailabilityList);
  }),
  /* Intercept "GET" get maintainers */
  http.get('*/personnel/readiness/unit/phase-maintainers', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    // Simulate UIC not found
    if (uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    // Simulate server error
    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Simulate no data
    if (uic === 'no-data') {
      return HttpResponse.json<IMaintainerDto[]>([]);
    }

    return HttpResponse.json<IMaintainerDto[]>(mockMaintainerDtoList);
  }),
  /* Intercept "GET" get unavailable personnel */
  http.get('*/personnel/readiness/unit/unavailable', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');
    const start_date = url.searchParams.get('start_date');
    const end_date = url.searchParams.get('end_date');

    // Simulate UIC not found
    if (uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    // Simulate server error
    if (uic === 'server-error' || start_date === 'server-error' || end_date === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Simulate no data
    if (uic === 'no-data') {
      return HttpResponse.json<IMaintenancePersonnelCount[]>([]);
    }

    return HttpResponse.json<IMaintenancePersonnelCount[]>([mockMaintenancePersonnelCount]);
  }),
  /* Intercept "GET" get phase team */
  http.get('*/personnel/readiness/phase-team/:phaseId', ({ params }) => {
    const { phaseId } = params;

    // Simulate phase not found
    if (phaseId === '999') {
      return HttpResponse.json({ error: 'Phase not found' }, { status: 404 });
    }

    // Simulate server error
    if (phaseId === '888') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json<IPhaseTeamDto>(mockPhaseTeamDto);
  }),
  /* Intercept "POST" add phase team */
  http.post('*/personnel/readiness/phase-team/:phaseId', ({ params }) => {
    const { phaseId } = params;

    // Simulate phase not found
    if (phaseId === '999') {
      return HttpResponse.json({ error: 'Phase not found' }, { status: 404 });
    }

    // Simulate server error
    if (phaseId === '888') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json(null, { status: 200 });
  }),
  /* Intercept "PUT" update phase team */
  http.put('*/personnel/readiness/phase-team/:phaseId', ({ params }) => {
    const { phaseId } = params;

    // Simulate phase not found
    if (phaseId === '999') {
      return HttpResponse.json({ error: 'Phase not found' }, { status: 404 });
    }

    // Simulate server error
    if (phaseId === '888') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json(null, { status: 200 });
  }),
];
