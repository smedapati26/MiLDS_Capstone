import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import {
  mockMissionFlownDetail,
  mockMissionFlownSummary,
  mockMissionFlownUnit,
} from 'vitest/mocks/griffin_api_handlers/readiness/mock_data/missions_flown_mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { missionsFlownApi } from '@store/griffin_api/readiness/slices/missionsFlownApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [missionsFlownApi.reducerPath]: missionsFlownApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(missionsFlownApi.middleware),
  });
};

describe('missionsFlownApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(missionsFlownApi.reducerPath).toBe('readinessMissionsFlownApi');
    });

    it('should have correct base query configuration', () => {
      expect(missionsFlownApi.endpoints).toBeDefined();
      expect(Object.keys(missionsFlownApi.endpoints)).toHaveLength(3);
    });

    it('should export all expected hooks', () => {
      expect(missionsFlownApi.useGetMissionsFlownQuery).toBeDefined();
      expect(missionsFlownApi.useGetMissionsFlownDetailQuery).toBeDefined();
      expect(missionsFlownApi.useLazyGetMissionsFlownDetailQuery).toBeDefined();
      expect(missionsFlownApi.useGetMissionsFlownSummaryQuery).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(missionsFlownApi.reducerPath);
    });
  });

  // SUCCESS - 200
  describe('useGetMissionsFlownQuery query', () => {
    it('should successfully fetch a hours flown by UIC', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => missionsFlownApi.useGetMissionsFlownQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([mockMissionFlownUnit]);
      expect(result.current.error).toBeUndefined();
    });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => missionsFlownApi.useGetMissionsFlownQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      // Initial loading state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isFetching).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isFetching).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });
    });

    // RTK Caching
    it('should cache results correctly', async () => {
      const wrapper = createWrapper(store);

      // First query
      const { result } = renderHook(() => missionsFlownApi.useGetMissionsFlownQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Second query with same parameters should use cache
      const { result: result2 } = renderHook(() => missionsFlownApi.useGetMissionsFlownQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      // Should immediately have data from cache
      expect(result2.current.data).toEqual([mockMissionFlownUnit]);
      expect(result2.current.isLoading).toBe(false);
    });

    // ERROR - 404 NOT_FOUND
    it('should handle on UIC not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => missionsFlownApi.useGetMissionsFlownQuery({ uic: 'not-found' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    // ERROR - 500 SERVER_ERROR
    it('should handle server errors', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => missionsFlownApi.useGetMissionsFlownQuery({ uic: 'server-error' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useGetMissionsFlownDetailQuery query', () => {
    it('should successfully fetch a hours flown by UIC', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () => missionsFlownApi.useGetMissionsFlownDetailQuery({ uic: 'TEST_UIC', mission_type: 'TRAINING' }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([mockMissionFlownDetail]);
      expect(result.current.error).toBeUndefined();
    });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () => missionsFlownApi.useGetMissionsFlownDetailQuery({ uic: 'TEST_UIC', mission_type: 'TRAINING' }),
        {
          wrapper,
        },
      );
      // Initial loading state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isFetching).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isFetching).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });
    });

    // RTK Caching
    it('should cache results correctly', async () => {
      const wrapper = createWrapper(store);

      // First query
      const { result } = renderHook(
        () => missionsFlownApi.useGetMissionsFlownDetailQuery({ uic: 'TEST_UIC', mission_type: 'TRAINING' }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Second query with same parameters should use cache
      const { result: result2 } = renderHook(
        () => missionsFlownApi.useGetMissionsFlownDetailQuery({ uic: 'TEST_UIC', mission_type: 'TRAINING' }),
        {
          wrapper,
        },
      );

      // Should immediately have data from cache
      expect(result2.current.data).toEqual([mockMissionFlownDetail]);
      expect(result2.current.isLoading).toBe(false);
    });

    // ERROR - 404 NOT_FOUND
    it('should handle on UIC not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () => missionsFlownApi.useGetMissionsFlownDetailQuery({ uic: 'not-found', mission_type: 'TRAINING' }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('should handle on mission type not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () => missionsFlownApi.useGetMissionsFlownDetailQuery({ uic: 'TEST_UIC', mission_type: 'not-found' }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    // ERROR - 500 SERVER_ERROR
    it('should handle server errors', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () => missionsFlownApi.useGetMissionsFlownDetailQuery({ uic: 'server-error', mission_type: 'server-error' }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useGetMissionsFlownSummaryQuery query', () => {
    it('should successfully fetch a hours flown by UIC', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => missionsFlownApi.useGetMissionsFlownSummaryQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([mockMissionFlownSummary]);
      expect(result.current.error).toBeUndefined();
    });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => missionsFlownApi.useGetMissionsFlownSummaryQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      // Initial loading state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isFetching).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isFetching).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });
    });

    // RTK Caching
    it('should cache results correctly', async () => {
      const wrapper = createWrapper(store);

      // First query
      const { result } = renderHook(() => missionsFlownApi.useGetMissionsFlownSummaryQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Second query with same parameters should use cache
      const { result: result2 } = renderHook(
        () => missionsFlownApi.useGetMissionsFlownSummaryQuery({ uic: 'TEST_UIC' }),
        {
          wrapper,
        },
      );

      // Should immediately have data from cache
      expect(result2.current.data).toEqual([mockMissionFlownSummary]);
      expect(result2.current.isLoading).toBe(false);
    });

    // ERROR - 404 NOT_FOUND
    it('should handle on UIC not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => missionsFlownApi.useGetMissionsFlownSummaryQuery({ uic: 'not-found' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    // ERROR - 500 SERVER_ERROR
    it('should handle server errors', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => missionsFlownApi.useGetMissionsFlownSummaryQuery({ uic: 'server-error' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useLazyGetMissionsFlownDetailQuery query', () => {
    it('should successfully fetch missions flown detail when triggered', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => missionsFlownApi.useLazyGetMissionsFlownDetailQuery(), {
        wrapper,
      });

      // Initially, no request should be made
      expect(result.current[1].data).toBeUndefined();
      expect(result.current[1].isLoading).toBe(false);
      expect(result.current[1].isUninitialized).toBe(true);

      // Trigger the query
      const [trigger] = result.current;
      trigger({ uic: 'TEST_UIC', mission_type: 'TRAINING' });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data).toEqual([mockMissionFlownDetail]);
      expect(result.current[1].error).toBeUndefined();
      expect(result.current[1].isUninitialized).toBe(false);
    });

    it('should track loading state correctly when triggered', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => missionsFlownApi.useLazyGetMissionsFlownDetailQuery(), {
        wrapper,
      });

      // Initially should not be loading
      expect(result.current[1].isLoading).toBe(false);
      expect(result.current[1].isFetching).toBe(false);
      expect(result.current[1].isUninitialized).toBe(true);

      // Trigger the query
      const [trigger] = result.current;
      trigger({ uic: 'TEST_UIC', mission_type: 'TRAINING' });

      // Wait for the loading state to be set and then complete
      await waitFor(() => {
        expect(result.current[1].isUninitialized).toBe(false);
        expect(result.current[1].isLoading).toBe(false);
        expect(result.current[1].isFetching).toBe(false);
        expect(result.current[1].isSuccess).toBe(true);
      });
    });

    it('should handle multiple triggers with different parameters', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => missionsFlownApi.useLazyGetMissionsFlownDetailQuery(), {
        wrapper,
      });

      const [trigger] = result.current;

      // First trigger
      trigger({ uic: 'TEST_UIC', mission_type: 'TRAINING' });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data).toEqual([mockMissionFlownDetail]);

      // Second trigger with different parameters
      trigger({ uic: 'TEST_UIC', mission_type: 'COMBAT' });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      // Should still return the mock data (since our mock doesn't differentiate)
      expect(result.current[1].data).toEqual([mockMissionFlownDetail]);
    });

    it('should handle UIC not found error when triggered', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => missionsFlownApi.useLazyGetMissionsFlownDetailQuery(), {
        wrapper,
      });

      const [trigger] = result.current;
      trigger({ uic: 'not-found', mission_type: 'TRAINING' });

      await waitFor(() => {
        expect(result.current[1].isError).toBe(true);
      });

      expect(result.current[1].error).toBeDefined();
      expect(result.current[1].data).toBeUndefined();
    });

    it('should handle mission type not found error when triggered', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => missionsFlownApi.useLazyGetMissionsFlownDetailQuery(), {
        wrapper,
      });

      const [trigger] = result.current;
      trigger({ uic: 'TEST_UIC', mission_type: 'not-found' });

      await waitFor(() => {
        expect(result.current[1].isError).toBe(true);
      });

      expect(result.current[1].error).toBeDefined();
      expect(result.current[1].data).toBeUndefined();
    });

    it('should handle server errors when triggered', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => missionsFlownApi.useLazyGetMissionsFlownDetailQuery(), {
        wrapper,
      });

      const [trigger] = result.current;
      trigger({ uic: 'server-error', mission_type: 'server-error' });

      await waitFor(() => {
        expect(result.current[1].isError).toBe(true);
      });

      expect(result.current[1].error).toBeDefined();
    });

    it('should return the same trigger function on re-renders', () => {
      const wrapper = createWrapper(store);

      const { result, rerender } = renderHook(() => missionsFlownApi.useLazyGetMissionsFlownDetailQuery(), {
        wrapper,
      });

      const [initialTrigger] = result.current;

      rerender();

      const [rerenderedTrigger] = result.current;

      expect(initialTrigger).toBe(rerenderedTrigger);
    });

    it('should allow triggering the same query multiple times', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => missionsFlownApi.useLazyGetMissionsFlownDetailQuery(), {
        wrapper,
      });

      const [trigger] = result.current;

      // First trigger
      trigger({ uic: 'TEST_UIC', mission_type: 'TRAINING' });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data).toEqual([mockMissionFlownDetail]);

      // Second trigger with same parameters
      trigger({ uic: 'TEST_UIC', mission_type: 'TRAINING' });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data).toEqual([mockMissionFlownDetail]);
    });

    it('should work with optional date parameters', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => missionsFlownApi.useLazyGetMissionsFlownDetailQuery(), {
        wrapper,
      });

      const [trigger] = result.current;
      trigger({
        uic: 'TEST_UIC',
        mission_type: 'TRAINING',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data).toEqual([mockMissionFlownDetail]);
      expect(result.current[1].error).toBeUndefined();
    });
  });

  describe('RTK Query Integration', () => {
    it('should handle multiple concurrent requests', async () => {
      const wrapper = createWrapper(store);

      const { result: result1 } = renderHook(() => missionsFlownApi.useGetMissionsFlownQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      const { result: result2 } = renderHook(
        () => missionsFlownApi.useGetMissionsFlownDetailQuery({ uic: 'TEST_UIC', mission_type: 'TRAINING' }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
        expect(result2.current.isSuccess).toBe(true);
      });

      expect(result1.current.data).toEqual([mockMissionFlownUnit]);
      expect(result2.current.data).toEqual([mockMissionFlownDetail]);
    });

    it('should handle concurrent lazy and regular queries', async () => {
      const wrapper = createWrapper(store);

      const { result: regularResult } = renderHook(
        () => missionsFlownApi.useGetMissionsFlownDetailQuery({ uic: 'TEST_UIC', mission_type: 'TRAINING' }),
        {
          wrapper,
        },
      );

      const { result: lazyResult } = renderHook(() => missionsFlownApi.useLazyGetMissionsFlownDetailQuery(), {
        wrapper,
      });

      // Trigger the lazy query
      const [trigger] = lazyResult.current;
      trigger({ uic: 'TEST_UIC', mission_type: 'COMBAT' });

      await waitFor(() => {
        expect(regularResult.current.isSuccess).toBe(true);
        expect(lazyResult.current[1].isSuccess).toBe(true);
      });

      expect(regularResult.current.data).toEqual([mockMissionFlownDetail]);
      expect(lazyResult.current[1].data).toEqual([mockMissionFlownDetail]);
    });
  });
});
