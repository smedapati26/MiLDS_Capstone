import { http, HttpResponse } from 'msw';

import { IMissionsFlownDataSet } from '@store/griffin_api/readiness/models';

import {
  mockMissionFlownDetail,
  mockMissionFlownSummary,
  mockMissionFlownUnit,
} from './mock_data/missions_flown_mock_data';

export const missionsFlownHandlers = [
  /* Intercept "GET" for Hours Flown by Unit */
  // useGetMissionsFlownQuery
  http.get('*/readiness/missions-flown', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    // Simulate UIC not found
    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    // Simulate server error
    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json<Array<IMissionsFlownDataSet>>([mockMissionFlownUnit]);
  }),

  /* Intercept "GET" for Hours Flown by Subordinates */
  // useGetMissionsFlownDetailQuery
  http.get('*/readiness/missions-flown-detail', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');
    const mission_type = url.searchParams.get('mission_type');

    // Simulate UIC not found
    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    // Simulate Mission Type not found
    if (!mission_type || mission_type === 'not-found') {
      return HttpResponse.json({ error: 'Mission Type not found' }, { status: 404 });
    }

    // Simulate server error
    if (uic === 'server-error' || mission_type === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json([mockMissionFlownDetail]);
  }),

  /* Intercept "GET" for Hours Flown by Models */
  // useGetMissionsFlownSummaryQuery
  http.get('*/readiness/missions-flown-summary', ({ request }) => {
    const url = new URL(request.url);
    const uic = url.searchParams.get('uic');

    // Simulate UIC not found
    if (!uic || uic === 'not-found') {
      return HttpResponse.json({ error: 'UIC not found' }, { status: 404 });
    }

    // Simulate server error
    if (uic === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json([mockMissionFlownSummary]);
  }),
];
