/* eslint-disable @typescript-eslint/ban-ts-comment */
import { http, HttpResponse } from 'msw';

import { tasksBaseUrl } from '@store/amap_ai/tasks/slices/tasksApi';

import { mockTasks } from './mock_data';
/**
 * Handlers for tasks API endpoints.
 */
export const tasksHandlers = [
  // Handler for fetching user tasks
  http.get(`${tasksBaseUrl}/:user_id/searchable_tasklist`, (req) => {
    const { user_id } = req.params;
    // @ts-expect-error
    const allTasks = req.url.searchParams.get('all_tasks') === 'true';

    // Check if user exists in mockTasks
    // @ts-expect-error
    if (!user_id || !mockTasks[user_id]) {
      return HttpResponse.json({ error: 'User tasks not found' }, { status: 404 });
    }

    // Return full or partial tasks based on 'all_tasks' parameter
    // @ts-expect-error
    const tasks = allTasks ? mockTasks[user_id].all : mockTasks[user_id].partial;
    return HttpResponse.json(tasks, { status: 200 });
  }),

  // Handler for other potential tasks-related endpoints (e.g., creating tasks)
  http.post(`${tasksBaseUrl}/:user_id/create_task`, async (req) => {
    const { user_id } = req.params;
    // @ts-expect-error
    const taskData = await req.json();

    if (!user_id || !taskData) {
      return HttpResponse.json({ error: 'Invalid task data' }, { status: 400 });
    }

    // Simulate adding task to mock data
    const newTask = { id: Date.now(), ...taskData };
    // @ts-expect-error
    mockTasks[user_id] = {
      // @ts-expect-error
      all: [...(mockTasks[user_id]?.all || []), newTask],
      // @ts-expect-error
      partial: [...(mockTasks[user_id]?.partial || []), newTask],
    };

    return HttpResponse.json(newTask, { status: 201 });
  }),
];
