import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import { mockFaultOverTime } from 'vitest/mocks/griffin_api_handlers/faults/mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { faultsOverTimeApi } from '@store/griffin_api/faults/slices/faultsOverTimeApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [faultsOverTimeApi.reducerPath]: faultsOverTimeApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(faultsOverTimeApi.middleware),
  });
};

describe('faultsOverTimeApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(faultsOverTimeApi.reducerPath).toBe('faultsApi');
    });

    it('should have correct base query configuration', () => {
      expect(faultsOverTimeApi.endpoints).toBeDefined();
      expect(Object.keys(faultsOverTimeApi.endpoints)).toHaveLength(1);
    });

    it('should export all expected hooks', () => {
      expect(faultsOverTimeApi.useGetFaultsOverTimeQuery).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(faultsOverTimeApi.reducerPath);
    });
  });

  describe('useGetFaultsOverTimeQuery query', () => {
    const queryParams = {
      uic: 'TEST_UIC',
      start_date: '2024-01-01',
      end_date: '2024-01-31',
    };
    const expected = [mockFaultOverTime];

    // SUCCESS - 200
    it('should successfully fetch faults over time data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => faultsOverTimeApi.useGetFaultsOverTimeQuery(queryParams), {
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

      const { result } = renderHook(() => faultsOverTimeApi.useGetFaultsOverTimeQuery(queryParams), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify the query was made with correct parameters
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toEqual(expected);
    });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => faultsOverTimeApi.useGetFaultsOverTimeQuery(queryParams), {
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
      const { result } = renderHook(() => faultsOverTimeApi.useGetFaultsOverTimeQuery(queryParams), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Second query with same parameters should use cache
      const { result: result2 } = renderHook(() => faultsOverTimeApi.useGetFaultsOverTimeQuery(queryParams), {
        wrapper,
      });

      // Should immediately have data from cache
      expect(result2.current.data).toEqual(expected);
      expect(result2.current.isLoading).toBe(false);
    });

    it('should handle different query parameters separately', async () => {
      const wrapper = createWrapper(store);

      const queryParams1 = { uic: 'UIC1', start_date: '2024-01-01', end_date: '2024-01-31' };
      const queryParams2 = { uic: 'UIC2', start_date: '2024-02-01', end_date: '2024-02-28' };

      // First query
      const { result: result1 } = renderHook(() => faultsOverTimeApi.useGetFaultsOverTimeQuery(queryParams1), {
        wrapper,
      });

      // Second query with different parameters
      const { result: result2 } = renderHook(() => faultsOverTimeApi.useGetFaultsOverTimeQuery(queryParams2), {
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
    // ERROR - 404 UIC NOT_FOUND
    it('should handle UIC not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParams = {
        uic: 'not-found',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      };

      const { result } = renderHook(() => faultsOverTimeApi.useGetFaultsOverTimeQuery(queryParams), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    // ERROR - 404 START_DATE NOT_FOUND
    it('should handle start_date not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParams = {
        uic: 'TEST_UIC',
        start_date: 'not-found',
        end_date: '2024-01-31',
      };

      const { result } = renderHook(() => faultsOverTimeApi.useGetFaultsOverTimeQuery(queryParams), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    // ERROR - 404 END_DATE NOT_FOUND
    it('should handle end_date not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParams = {
        uic: 'TEST_UIC',
        start_date: '2024-01-01',
        end_date: 'not-found',
      };

      const { result } = renderHook(() => faultsOverTimeApi.useGetFaultsOverTimeQuery(queryParams), {
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
      const queryParams = {
        uic: 'server-error',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      };

      const { result } = renderHook(() => faultsOverTimeApi.useGetFaultsOverTimeQuery(queryParams), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('should handle missing required parameters', async () => {
      const wrapper = createWrapper(store);

      // Test with missing uic
      const { result: resultMissingUic } = renderHook(
        () =>
          faultsOverTimeApi.useGetFaultsOverTimeQuery({
            uic: '',
            start_date: '2024-01-01',
            end_date: '2024-01-31',
          }),
        { wrapper },
      );

      await waitFor(() => {
        expect(resultMissingUic.current.isError).toBe(true);
      });

      // Test with missing start_date
      const { result: resultMissingStartDate } = renderHook(
        () =>
          faultsOverTimeApi.useGetFaultsOverTimeQuery({
            uic: 'TEST_UIC',
            start_date: '',
            end_date: '2024-01-31',
          }),
        { wrapper },
      );

      await waitFor(() => {
        expect(resultMissingStartDate.current.isError).toBe(true);
      });

      // Test with missing end_date
      const { result: resultMissingEndDate } = renderHook(
        () =>
          faultsOverTimeApi.useGetFaultsOverTimeQuery({
            uic: 'TEST_UIC',
            start_date: '2024-01-01',
            end_date: '',
          }),
        { wrapper },
      );

      await waitFor(() => {
        expect(resultMissingEndDate.current.isError).toBe(true);
      });
    });
  });

  // TRANSFORM RESPONSE
  describe('Response Transformation', () => {
    it('should transform response correctly', async () => {
      const wrapper = createWrapper(store);
      const queryParams = {
        uic: 'TEST_UIC',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      };

      const { result } = renderHook(() => faultsOverTimeApi.useGetFaultsOverTimeQuery(queryParams), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify the response structure matches IFaultOverTime interface
      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);

      if (result.current.data && result.current.data.length > 0) {
        const faultData = result.current.data[0];
        expect(faultData).toHaveProperty('reporting_period');
        expect(faultData).toHaveProperty('no_status');
        expect(faultData).toHaveProperty('cleared');
        expect(faultData).toHaveProperty('ti_cleared');
        expect(faultData).toHaveProperty('diagonal');
        expect(faultData).toHaveProperty('dash');
        expect(faultData).toHaveProperty('admin_deadline');
        expect(faultData).toHaveProperty('deadline');
        expect(faultData).toHaveProperty('circle_x');
        expect(faultData).toHaveProperty('nuclear');
        expect(faultData).toHaveProperty('chemical');
        expect(faultData).toHaveProperty('biological');
      }
    });
  });
});
