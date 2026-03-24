import { http, HttpResponse } from 'msw';

import { ICrewExperienceReadinessLevel, ICrewExperienceSkill } from '@store/griffin_api/personnel/models';
import { ICrewStrengthMosRes, ICrewStrengthSkillRes } from '@store/griffin_api/personnel/models/ICrewStrength';

import {
  mockCrewExperienceReadinessLevel,
  mockCrewExperienceSkill,
  mockCrewStrengthMos,
  mockCrewStrengthSkills,
  mockPersonnelSkills,
} from './mock_data';

export const personnelHandlers = [
  /* Intercept "GET" crew-expr-skill */
  // useGetCrewExperienceSkillQuery
  http.get('*/personnel/crew-expr-skill', ({ request }) => {
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

    return HttpResponse.json<Array<ICrewExperienceSkill>>([mockCrewExperienceSkill]);
  }),

  /* Intercept "GET" crew-expr-rl */
  // useGetCrewExperienceReadinessLevelQuery
  http.get('*/personnel/crew-expr-rl', ({ request }) => {
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

    return HttpResponse.json<Array<ICrewExperienceReadinessLevel>>(mockCrewExperienceReadinessLevel);
  }),

  /* Intercept "GET" skills */
  // useGetPersonnelSkillsQuery
  http.get('*/personnel/skills', ({ request }) => {
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

    return HttpResponse.json<string[]>(mockPersonnelSkills);
  }),

  /* Intercept "GET" crew-strength-skill */
  // useGetCrewStrengthSkillsQuery
  http.get('*/personnel/crew-strength-skill', ({ request }) => {
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

    return HttpResponse.json<ICrewStrengthSkillRes[]>(mockCrewStrengthSkills);
  }),

  /* Intercept "GET" crew-strength-mos */
  // useGetCrewStrengthMosQuery
  http.get('*/personnel/crew-strength-mos', ({ request }) => {
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

    return HttpResponse.json<ICrewStrengthMosRes[]>(mockCrewStrengthMos);
  }),
];
