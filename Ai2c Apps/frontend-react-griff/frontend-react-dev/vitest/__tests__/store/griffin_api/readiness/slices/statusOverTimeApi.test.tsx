import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import { statusOverTimeMockData } from 'vitest/mocks/griffin_api_handlers/readiness/mock_data/status_over_time_mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { mapToIStatusOverTime } from '@store/griffin_api/readiness/models';
import { statusOverTimeApi } from '@store/griffin_api/readiness/slices/statusOverTimeApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [statusOverTimeApi.reducerPath]: statusOverTimeApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(statusOverTimeApi.middleware),
  });
};

describe('statusOverTimeApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(statusOverTimeApi.reducerPath).toBe('readinessStatusOverTimeApi');
    });

    it('should have correct base query configuration', () => {
      expect(statusOverTimeApi.endpoints).toBeDefined();
      expect(Object.keys(statusOverTimeApi.endpoints)).toHaveLength(1);
    });

    it('should export all expected hooks', () => {
      expect(statusOverTimeApi.useGetStatusOverTimeQuery).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(statusOverTimeApi.reducerPath);
    });
  });

  // SUCCESS - 200
  describe('useGetStatusOverTimeQuery query', () => {
    const expected = [statusOverTimeMockData].map(mapToIStatusOverTime);

    it('should successfully fetch a hours flown by UIC', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => statusOverTimeApi.useGetStatusOverTimeQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      expect(result.current.error).toBeUndefined();
    });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => statusOverTimeApi.useGetStatusOverTimeQuery({ uic: 'TEST_UIC' }), {
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
      const { result } = renderHook(() => statusOverTimeApi.useGetStatusOverTimeQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Second query with same parameters should use cache
      const { result: result2 } = renderHook(() => statusOverTimeApi.useGetStatusOverTimeQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      // Should immediately have data from cache
      expect(result2.current.data).toEqual(expected);
      expect(result2.current.isLoading).toBe(false);
    });

    // ERROR - 404 NOT_FOUND
    it('should handle on UIC not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => statusOverTimeApi.useGetStatusOverTimeQuery({ uic: 'not-found' }), {
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

      const { result } = renderHook(() => statusOverTimeApi.useGetStatusOverTimeQuery({ uic: 'server-error' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });
});
