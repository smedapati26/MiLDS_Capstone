/* eslint-disable @typescript-eslint/ban-ts-comment */
import { http, HttpResponse } from 'msw';

import { eventsBaseUrl } from '@store/amap_ai/events/slices';

import {
  mockAwardTypes,
  mockDa7817s,
  mockEvaluationTypes,
  mockEventTypes,
  mockTasks,
  mockTrainingTypes,
} from './mock_data';

/**
 * Handlers for maintainerRecord API endpoints.
 */
export const maintainerRecordHandlers = [
  // Handler for fetching event types
  http.get(`${eventsBaseUrl}/event_types`, () => {
    if (!mockEventTypes || mockEventTypes.length === 0) {
      return HttpResponse.json({ error: 'Event types not found' }, { status: 404 });
    }

    return HttpResponse.json(mockEventTypes, { status: 200 });
  }),

  // Handler for fetching evaluation types
  http.get(`${eventsBaseUrl}/evaluation_types`, () => {
    if (!mockEvaluationTypes || mockEvaluationTypes.length === 0) {
      return HttpResponse.json({ error: 'Evaluation types not found' }, { status: 404 });
    }

    return HttpResponse.json(mockEvaluationTypes, { status: 200 });
  }),

  // Handler for fetching award types
  http.get(`${eventsBaseUrl}/award_types`, () => {
    if (!mockAwardTypes || mockAwardTypes.length === 0) {
      return HttpResponse.json({ error: 'Award types not found' }, { status: 404 });
    }

    return HttpResponse.json(mockAwardTypes, { status: 200 });
  }),

  // Handler for fetching training types
  http.get(`${eventsBaseUrl}/training_types`, () => {
    if (!mockTrainingTypes || mockTrainingTypes.length === 0) {
      return HttpResponse.json({ error: 'Training types not found' }, { status: 404 });
    }

    return HttpResponse.json(mockTrainingTypes, { status: 200 });
  }),

  // Handler for fetching user tasks
  http.get(`${eventsBaseUrl}/training_types`, (req) => {
    // @ts-expect-error
    const allTasks = req.url.searchParams.get('all_tasks') === 'true';
    // @ts-expect-error
    const userId = req.url.searchParams.get('user_id');

    // @ts-expect-error
    if (!userId || !mockTasks[userId]) {
      return HttpResponse.json({ error: 'User tasks not found' }, { status: 404 });
    }

    // @ts-expect-error
    const tasks = allTasks ? mockTasks[userId].all : mockTasks[userId].partial;
    return HttpResponse.json(tasks, { status: 200 });
  }),

  // Handler for fetching DA 7817 events
  http.get(`${eventsBaseUrl}/events/user/:user_id`, (req) => {
    const { user_id } = req.params;

    // @ts-expect-error
    if (!user_id || !mockDa7817s[user_id]) {
      return HttpResponse.json({ error: 'DA 7817 events not found' }, { status: 404 });
    }

    // @ts-expect-error
    return HttpResponse.json({ da_7817s: mockDa7817s[user_id] }, { status: 200 });
  }),

  // Handler for creating a new event
  http.post(`${eventsBaseUrl}/:recorded_by/add_7817`, async (req) => {
    const { recorded_by } = req.params;
    // @ts-expect-error
    const eventData = await req.json();

    if (!recorded_by || !eventData) {
      return HttpResponse.json({ error: 'Invalid event creation data' }, { status: 400 });
    }

    // Simulate successful creation
    const newEvent = {
      id: Date.now(), // Mock ID
      ...eventData,
    };

    // @ts-expect-error
    mockDa7817s[recorded_by] = [...(mockDa7817s[recorded_by] || []), newEvent];

    return HttpResponse.json(newEvent, { status: 201 });
  }),
];
