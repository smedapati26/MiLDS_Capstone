import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import { mockInspectionTypes } from 'vitest/mocks/griffin_api_handlers/inspections/mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { mapToIInspectionType } from '@store/griffin_api/inspections/models';
import { inspectionsApi } from '@store/griffin_api/inspections/slices/inspectionsApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [inspectionsApi.reducerPath]: inspectionsApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(inspectionsApi.middleware),
  });
};

describe('inspectionsApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(inspectionsApi.reducerPath).toBe('inspectionsApi');
    });

    it('should have correct base query configuration', () => {
      expect(inspectionsApi.endpoints).toBeDefined();
      expect(Object.keys(inspectionsApi.endpoints)).toHaveLength(2);
    });

    it('should export all expected hooks', () => {
      expect(inspectionsApi.useGetInspectionTypesQuery).toBeDefined();
      expect(inspectionsApi.useGetInspectionOptionsForUnitQuery).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(inspectionsApi.reducerPath);
    });
  });

  describe('useGetInspectionTypesQuery query', () => {
    const expected = mockInspectionTypes
      .map(mapToIInspectionType)
      .filter((inspection) => inspection.model === 'CH-47F');

    // SUCCESS - 200
    it('should successfully fetch a hours flown by UIC', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => inspectionsApi.useGetInspectionTypesQuery('CH-47F'), {
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

      const { result } = renderHook(() => inspectionsApi.useGetInspectionTypesQuery('CH-47F'), {
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
      const { result } = renderHook(() => inspectionsApi.useGetInspectionTypesQuery('CH-47F'), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Second query with same parameters should use cache
      const { result: result2 } = renderHook(() => inspectionsApi.useGetInspectionTypesQuery('CH-47F'), {
        wrapper,
      });

      // Should immediately have data from cache
      expect(result2.current.data).toEqual(expected);
      expect(result2.current.isLoading).toBe(false);
    });

    // ERROR - 404 NOT_FOUND
    it('should handle on UIC not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => inspectionsApi.useGetInspectionTypesQuery('not-found'), {
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

      const { result } = renderHook(() => inspectionsApi.useGetInspectionTypesQuery('server-error'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });
});
