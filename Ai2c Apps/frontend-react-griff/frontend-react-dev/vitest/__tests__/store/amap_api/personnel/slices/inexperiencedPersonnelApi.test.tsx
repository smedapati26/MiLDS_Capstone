import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import { mockMaintenancePersonnelCount } from 'vitest/mocks/amap_api_handlers/personnel/mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { inexperiencedPersonnelApi } from '@store/amap_api/personnel/slices/inexperiencedPersonnelApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [inexperiencedPersonnelApi.reducerPath]: inexperiencedPersonnelApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(inexperiencedPersonnelApi.middleware),
  });
};

describe('inexperiencedPersonnelApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(inexperiencedPersonnelApi.reducerPath).toBe('amapInexperiencedPersonnelApi');
    });

    it('should have correct base query configuration', () => {
      expect(inexperiencedPersonnelApi.endpoints).toBeDefined();
      expect(Object.keys(inexperiencedPersonnelApi.endpoints)).toHaveLength(1);
    });

    it('should export all expected hooks', () => {
      expect(inexperiencedPersonnelApi.useGetInexperiencedPersonnelQuery).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(inexperiencedPersonnelApi.reducerPath);
    });
  });

  describe('useGetInexperiencedPersonnelQuery query', () => {
    // SUCCESS - 200
    it('should successfully fetch inexperienced personnel by UIC', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () =>
          inexperiencedPersonnelApi.useGetInexperiencedPersonnelQuery({
            uic: 'TEST_UIC',
            start_date: '2023-01-01',
            end_date: '2023-12-31',
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([mockMaintenancePersonnelCount]);
      expect(result.current.error).toBeUndefined();
    });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () =>
          inexperiencedPersonnelApi.useGetInexperiencedPersonnelQuery({
            uic: 'TEST_UIC',
            start_date: '2023-01-01',
            end_date: '2023-12-31',
          }),
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
        () =>
          inexperiencedPersonnelApi.useGetInexperiencedPersonnelQuery({
            uic: 'TEST_UIC',
            start_date: '2023-01-01',
            end_date: '2023-12-31',
          }),
        {
          wrapper,
        },
      );
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Second query with same parameters should use cache
      const { result: result2 } = renderHook(
        () =>
          inexperiencedPersonnelApi.useGetInexperiencedPersonnelQuery({
            uic: 'TEST_UIC',
            start_date: '2023-01-01',
            end_date: '2023-12-31',
          }),
        {
          wrapper,
        },
      );

      // Should immediately have data from cache
      expect(result2.current.data).toEqual([mockMaintenancePersonnelCount]);
      expect(result2.current.isLoading).toBe(false);
    });

    // ERROR - 404 NOT_FOUND
    it('should handle when UIC not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () =>
          inexperiencedPersonnelApi.useGetInexperiencedPersonnelQuery({
            uic: 'not-found',
            start_date: '2023-01-01',
            end_date: '2023-12-31',
          }),
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
        () =>
          inexperiencedPersonnelApi.useGetInexperiencedPersonnelQuery({
            uic: 'server-error',
            start_date: '2023-01-01',
            end_date: '2023-12-31',
          }),
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
});
