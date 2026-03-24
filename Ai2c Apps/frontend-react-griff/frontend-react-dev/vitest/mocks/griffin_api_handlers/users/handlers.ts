import { http, HttpResponse } from 'msw';

import { loginUrl } from '@loaders/authLoader';

import { IAppUserDto, ICreateAppUserOut } from '@store/griffin_api/users/models/IAppUser';

import { mockAppUserDto, mockCreatedUserDto, mockElevatedRoles, mockUpdatedUserDto } from './mock_data';

export const GRIFFIN_MOCK_BASE_URL = 'http://127.0.0.1:8000/data/users';

export const griffinUserHandlers = [
  /* Intercept "GET" who-am-i */
  http.get(loginUrl, () => {
    return HttpResponse.json<IAppUserDto>(mockAppUserDto);
  }),

  /* Intercept "POST" create user */
  http.post(`${GRIFFIN_MOCK_BASE_URL}`, async ({ request }) => {
    const body = (await request.json()) as ICreateAppUserOut;

    // Simulate validation error
    if (!body || typeof body !== 'object') {
      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Simulate server error for specific test case
    if (body.user_id === 'error-test') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json<IAppUserDto>(mockCreatedUserDto, { status: 201 });
  }),

  /* Intercept "GET" get user by ID */
  http.get(`${GRIFFIN_MOCK_BASE_URL}/:userId`, ({ params }) => {
    const { userId } = params;

    // Simulate user not found
    if (userId === 'not-found') {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Simulate server error
    if (userId === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Return mock user for valid IDs
    return HttpResponse.json<IAppUserDto>(mockAppUserDto);
  }),

  /* Intercept "PUT" update user */
  http.put(`${GRIFFIN_MOCK_BASE_URL}/:userId`, async ({ params, request }) => {
    const { userId } = params;
    const body = (await request.json()) as Partial<ICreateAppUserOut>;

    // Simulate user not found
    if (userId === 'not-found') {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Simulate validation error
    if (!body || typeof body !== 'object') {
      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Simulate server error
    if (userId === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json<IAppUserDto>(mockUpdatedUserDto);
  }),

  /* Intercept "GET" get user elevated roles */
  http.get(`${GRIFFIN_MOCK_BASE_URL}/elevated_roles/:userId`, ({ params }) => {
    const { userId } = params;

    // Simulate user not found
    if (userId === 'not-found') {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Simulate server error
    if (userId === 'server-error') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Simulate user with no elevated roles
    if (userId === 'no-roles') {
      return HttpResponse.json({ admin: [], write: [] });
    }

    return HttpResponse.json(mockElevatedRoles);
  }),
];
