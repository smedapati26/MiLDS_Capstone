import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { maintenanceCountsApi } from '@store/griffin_api/events/slices/maintenanceCountsApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [maintenanceCountsApi.reducerPath]: maintenanceCountsApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(maintenanceCountsApi.middleware),
  });
};

describe('maintenanceCountsApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(maintenanceCountsApi.reducerPath).toBe('eventMaintenanceCountsApi');
    });

    it('should have correct base query configuration', () => {
      expect(maintenanceCountsApi.endpoints).toBeDefined();
      expect(Object.keys(maintenanceCountsApi.endpoints)).toHaveLength(1);
    });

    it('should export expected hook', () => {
      expect(maintenanceCountsApi.useGetMaintenanceSchedulerQuery).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(maintenanceCountsApi.reducerPath);
    });
  });

  describe('useGetMaintenanceSchedulerQuery', () => {
    const queryParam = { uic: 'TEST_UIC', start_date: '2023-01-01', end_date: '2023-01-31' };
    const expected = {
      unscheduled: [
        { date: '2023-01-01', unscheduled: 5 },
        { date: '2023-01-02', unscheduled: 3 },
      ],
      scheduled: [
        { date: '2023-01-01', scheduled: 10 },
        { date: '2023-01-02', scheduled: 8 },
      ],
    };

    // SUCCESS - 200
    it('should successfully fetch maintenance scheduler data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => maintenanceCountsApi.useGetMaintenanceSchedulerQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      expect(result.current.error).toBeUndefined();
    });

    it('should pass correct query parameters', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => maintenanceCountsApi.useGetMaintenanceSchedulerQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toEqual(expected);
    });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => maintenanceCountsApi.useGetMaintenanceSchedulerQuery(queryParam), {
        wrapper,
      });

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

      const { result } = renderHook(() => maintenanceCountsApi.useGetMaintenanceSchedulerQuery(queryParam), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const { result: result2 } = renderHook(() => maintenanceCountsApi.useGetMaintenanceSchedulerQuery(queryParam), {
        wrapper,
      });

      expect(result2.current.data).toEqual(expected);
      expect(result2.current.isLoading).toBe(false);
    });

    it('should handle different query parameters separately', async () => {
      const wrapper = createWrapper(store);

      const queryParam1 = { uic: 'UIC1', start_date: '2023-01-01', end_date: '2023-01-31' };
      const queryParam2 = { uic: 'UIC2', start_date: '2023-01-01', end_date: '2023-01-31' };

      const { result: result1 } = renderHook(() => maintenanceCountsApi.useGetMaintenanceSchedulerQuery(queryParam1), {
        wrapper,
      });

      const { result: result2 } = renderHook(() => maintenanceCountsApi.useGetMaintenanceSchedulerQuery(queryParam2), {
        wrapper,
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
        expect(result2.current.isSuccess).toBe(true);
      });

      expect(result1.current.data).toEqual(expected);
      expect(result2.current.data).toEqual(expected);
    });
  });

  // ERROR HANDLING
  describe('Error Handling', () => {
    it('should handle UIC not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'not-found', start_date: '2023-01-01', end_date: '2023-01-31' };

      const { result } = renderHook(() => maintenanceCountsApi.useGetMaintenanceSchedulerQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('should handle server errors', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'server-error', start_date: '2023-01-01', end_date: '2023-01-31' };

      const { result } = renderHook(() => maintenanceCountsApi.useGetMaintenanceSchedulerQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });
});
