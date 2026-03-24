import { describe, expect, it } from 'vitest';
import { ProviderWrapper } from 'vitest/helpers';
import { handlers } from 'vitest/mocks/handlers/handlers';
import { server } from 'vitest/mocks/server';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';

import { tasksApiSlice, useGetAllTasksQuery, useLazyGetUserTasksQuery } from '@store/amap_ai/tasks/slices/tasksApi';

// Mock server setup
server.use(...handlers);

// Configure store
const store = configureStore({
  reducer: {
    [tasksApiSlice.reducerPath]: tasksApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(tasksApiSlice.middleware),
});

// Provider wrapper for hooks
const wrapper = (props: { children: React.ReactNode }) => (
  <ProviderWrapper store={store}>{props.children}</ProviderWrapper>
);

describe('tasksApiSlice', () => {
  it('fetches user tasks lazily (all tasks)', async () => {
    const { result } = renderHook(() => useLazyGetUserTasksQuery(), { wrapper });

    const [triggerFetchTasks] = result.current;
    const response = await triggerFetchTasks({ user_id: '123', all_tasks: true });

    expect(response.data).toBeUndefined();
  });

  it('fetches user tasks lazily (partial tasks)', async () => {
    const { result } = renderHook(() => useLazyGetUserTasksQuery(), { wrapper });

    const [triggerFetchTasks] = result.current;
    const response = await triggerFetchTasks({ user_id: '123', all_tasks: false });

    expect(response.data).toBeUndefined();
  });

  it('handles user not found error', async () => {
    const { result } = renderHook(() => useLazyGetUserTasksQuery(), { wrapper });

    const [triggerFetchTasks] = result.current;
    const response = await triggerFetchTasks({ user_id: '999', all_tasks: false });

    expect(response.data).toBeUndefined();
  });

  it('fetches all tasks with pagination and filters', async () => {
    const { result } = renderHook(
      () =>
        useGetAllTasksQuery({
          limit: 10,
          offset: 0,
          mos: ['91B'],
          skill_level: ['SL3'],
          proponent: ['Ordnance'],
        }),
      { wrapper },
    );

    expect(result.current.isFetching).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});
