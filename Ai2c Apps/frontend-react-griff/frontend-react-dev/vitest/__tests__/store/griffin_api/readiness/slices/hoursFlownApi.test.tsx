import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import {
  mockHoursFlownModel,
  mockHoursFlownSubordinate,
  mockHoursFlownUnit,
} from 'vitest/mocks/griffin_api_handlers/readiness/mock_data/hours_flown_mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { hoursFlownApi } from '@store/griffin_api/readiness/slices/hoursFlownApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [hoursFlownApi.reducerPath]: hoursFlownApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(hoursFlownApi.middleware),
  });
};

describe('hoursFlownApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(hoursFlownApi.reducerPath).toBe('readinessHoursFlownApi');
    });

    it('should have correct base query configuration', () => {
      expect(hoursFlownApi.endpoints).toBeDefined();
      expect(Object.keys(hoursFlownApi.endpoints)).toHaveLength(3);
    });

    it('should export all expected hooks', () => {
      expect(hoursFlownApi.useGetHoursFlownUnitsQuery).toBeDefined();
      expect(hoursFlownApi.useGetHoursFlownSubordinatesQuery).toBeDefined();
      expect(hoursFlownApi.useGetHoursFlownModelsQuery).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(hoursFlownApi.reducerPath);
    });
  });

  // SUCCESS - 200
  describe('getHoursFlownUnits query', () => {
    it('should successfully fetch a hours flown by UIC', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => hoursFlownApi.useGetHoursFlownUnitsQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([mockHoursFlownUnit]);
      expect(result.current.error).toBeUndefined();
    });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => hoursFlownApi.useGetHoursFlownUnitsQuery({ uic: 'TEST_UIC' }), {
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
      const { result } = renderHook(() => hoursFlownApi.useGetHoursFlownUnitsQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Second query with same parameters should use cache
      const { result: result2 } = renderHook(() => hoursFlownApi.useGetHoursFlownUnitsQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      // Should immediately have data from cache
      expect(result2.current.data).toEqual([mockHoursFlownUnit]);
      expect(result2.current.isLoading).toBe(false);
    });

    // ERROR - 404 NOT_FOUND
    it('should handle on UIC not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => hoursFlownApi.useGetHoursFlownUnitsQuery({ uic: 'not-found' }), {
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

      const { result } = renderHook(() => hoursFlownApi.useGetHoursFlownUnitsQuery({ uic: 'server-error' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('getHoursFlownSubordinates query', () => {
    it('should successfully fetch a hours flown by UIC', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => hoursFlownApi.useGetHoursFlownSubordinatesQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([mockHoursFlownSubordinate]);
      expect(result.current.error).toBeUndefined();
    });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => hoursFlownApi.useGetHoursFlownSubordinatesQuery({ uic: 'TEST_UIC' }), {
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
      const { result } = renderHook(() => hoursFlownApi.useGetHoursFlownSubordinatesQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Second query with same parameters should use cache
      const { result: result2 } = renderHook(
        () => hoursFlownApi.useGetHoursFlownSubordinatesQuery({ uic: 'TEST_UIC' }),
        {
          wrapper,
        },
      );

      // Should immediately have data from cache
      expect(result2.current.data).toEqual([mockHoursFlownSubordinate]);
      expect(result2.current.isLoading).toBe(false);
    });

    // ERROR - 404 NOT_FOUND
    it('should handle on UIC not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => hoursFlownApi.useGetHoursFlownSubordinatesQuery({ uic: 'not-found' }), {
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

      const { result } = renderHook(() => hoursFlownApi.useGetHoursFlownSubordinatesQuery({ uic: 'server-error' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('getHoursFlownModels query', () => {
    it('should successfully fetch a hours flown by UIC', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => hoursFlownApi.useGetHoursFlownModelsQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([mockHoursFlownModel]);
      expect(result.current.error).toBeUndefined();
    });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => hoursFlownApi.useGetHoursFlownModelsQuery({ uic: 'TEST_UIC' }), {
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
      const { result } = renderHook(() => hoursFlownApi.useGetHoursFlownModelsQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Second query with same parameters should use cache
      const { result: result2 } = renderHook(() => hoursFlownApi.useGetHoursFlownModelsQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      // Should immediately have data from cache
      expect(result2.current.data).toEqual([mockHoursFlownModel]);
      expect(result2.current.isLoading).toBe(false);
    });

    // ERROR - 404 NOT_FOUND
    it('should handle on UIC not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => hoursFlownApi.useGetHoursFlownModelsQuery({ uic: 'not-found' }), {
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

      const { result } = renderHook(() => hoursFlownApi.useGetHoursFlownModelsQuery({ uic: 'server-error' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('RTK Query Integration', () => {
    it('should handle multiple concurrent requests', async () => {
      const wrapper = createWrapper(store);

      const { result: result1 } = renderHook(() => hoursFlownApi.useGetHoursFlownUnitsQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      const { result: result2 } = renderHook(
        () => hoursFlownApi.useGetHoursFlownSubordinatesQuery({ uic: 'TEST_UIC' }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
        expect(result2.current.isSuccess).toBe(true);
      });

      expect(result1.current.data).toEqual([mockHoursFlownUnit]);
      expect(result2.current.data).toEqual([mockHoursFlownSubordinate]);
    });
  });
});
