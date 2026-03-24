import { describe, expect, it } from 'vitest';
import { ProviderWrapper } from 'vitest/helpers';
import { handlers } from 'vitest/mocks/handlers/handlers';
import { server } from 'vitest/mocks/server';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import {
  eventsApiSlice,
  useCreateEventMutation,
  useCreateMassEventMutation,
  useGetDa7817sQuery,
  useGetEvaluationTypesQuery,
  useGetEventTypesQuery,
  useLazyGetAwardTypesQuery,
  useLazyGetTrainingTypesQuery,
} from '@store/amap_ai/events/slices';

// Mock server setup
server.use(...handlers);

// Configure store
const store = configureStore({
  reducer: {
    [eventsApiSlice.reducerPath]: eventsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(eventsApiSlice.middleware),
});

// Provider wrapper for hooks
const wrapper = (props: { children: React.ReactNode }) => (
  <ProviderWrapper store={store}>{props.children}</ProviderWrapper>
);

describe('eventsApiSlice', () => {
  it('fetches event types successfully', async () => {
    const { result } = renderHook(() => useGetEventTypesQuery(null), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.data).toBeDefined();
      expect(result.current.error).toBeUndefined();
    });
  });

  it('fetches evaluation types successfully', async () => {
    const { result } = renderHook(() => useGetEvaluationTypesQuery(null), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.data).toBeDefined();
    });
  });

  it('fetches award types successfully', async () => {
    const { result } = renderHook(() => useLazyGetAwardTypesQuery(), { wrapper });

    const [triggerAwardTypes] = result.current;
    const response = await triggerAwardTypes(null);

    expect(response.data).toBeDefined();
  });

  it('fetches training types lazily', async () => {
    const { result } = renderHook(() => useLazyGetTrainingTypesQuery(), { wrapper });

    const [triggerTrainingTypes] = result.current;
    const response = await triggerTrainingTypes(null);

    expect(response.data).toBeDefined();
  });

  it('fetches DA 7817s successfully for a user', async () => {
    const { result } = renderHook(() => useGetDa7817sQuery({ user_id: '123' }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
  });

  it('creates an event successfully', async () => {
    const { result } = renderHook(() => useCreateEventMutation(), { wrapper });

    const mockEventData = {
      recorded_by: 'user123',
      event_type: 'Training',
      evaluation_type: 'Annual',
      award_type: 'Achievement',
      training_type: 'TCS',
      comment: 'Event test comment.',
    };

    const [triggerCreateEvent, { isLoading, error }] = result.current;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    const response = await triggerCreateEvent(mockEventData);

    expect(isLoading).toBeFalsy();
    expect(error).toBeUndefined();
    expect(response).toBeDefined(); // Validate response structure if applicable
  });

  it('creates a mass event successfully', async () => {
    const { result } = renderHook(() => useCreateMassEventMutation(), { wrapper });

    const mockEventData = [
      {
        recorded_by: 'user123',
        event_type: 'Training',
        evaluation_type: 'Annual',
        award_type: 'Achievement',
        training_type: 'TCS',
        comment: 'Event test comment.',
      },
    ];

    const [triggerCreateMassEvent, { isLoading, error }] = result.current;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    const response = await triggerCreateMassEvent(mockEventData);

    expect(isLoading).toBeFalsy();
    expect(error).toBeUndefined();
    expect(response).toBeDefined(); // Validate response structure if applicable
  });
});
