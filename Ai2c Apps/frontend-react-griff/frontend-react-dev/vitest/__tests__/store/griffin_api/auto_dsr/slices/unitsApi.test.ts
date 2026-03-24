import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import { mockSimilarUnitsResponse, mockUnitBriefDto } from 'vitest/mocks/griffin_api_handlers/auto_dsr/mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { mapToIUnitBrief } from '@store/griffin_api/auto_dsr/models';
import { unitsApi } from '@store/griffin_api/auto_dsr/slices/unitsApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [unitsApi.reducerPath]: unitsApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(unitsApi.middleware),
  });
};

describe('unitsApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(unitsApi.reducerPath).toBe('unitsApi');
    });

    it('should have correct base query configuration', () => {
      expect(unitsApi.endpoints).toBeDefined();
      expect(Object.keys(unitsApi.endpoints)).toHaveLength(2);
    });

    it('should export all expected hooks', () => {
      expect(unitsApi.useGetUnitsQuery).toBeDefined();
      expect(unitsApi.useGetSimilarUnitsQuery).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(unitsApi.reducerPath);
    });
  });

  describe('useGetUnitsQuery', () => {
    const queryParam = { topLevelUic: 'TEST_UIC' };
    const expected = [mockUnitBriefDto].map(mapToIUnitBrief);

    it('should successfully fetch units data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => unitsApi.useGetUnitsQuery(queryParam), {
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

      const { result } = renderHook(() => unitsApi.useGetUnitsQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toEqual(expected);
    });

    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => unitsApi.useGetUnitsQuery(queryParam), {
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

    it('should handle top level UIC not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { topLevelUic: 'not-found' };

      const { result } = renderHook(() => unitsApi.useGetUnitsQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useGetSimilarUnitsQuery', () => {
    const queryParam = { uic: 'TEST_UIC' };
    const expected = mockSimilarUnitsResponse.similar_units;

    it('should successfully fetch similar units data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => unitsApi.useGetSimilarUnitsQuery(queryParam), {
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

      const { result } = renderHook(() => unitsApi.useGetSimilarUnitsQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toEqual(expected);
    });

    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => unitsApi.useGetSimilarUnitsQuery(queryParam), {
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

    it('should handle UIC not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'not-found' };

      const { result } = renderHook(() => unitsApi.useGetSimilarUnitsQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  // ERROR HANDLING
  describe('Error Handling', () => {
    it('should handle server errors for getUnits', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { topLevelUic: 'server-error' };

      const { result } = renderHook(() => unitsApi.useGetUnitsQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('should handle server errors for getSimilarUnits', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'server-error' };

      const { result } = renderHook(() => unitsApi.useGetSimilarUnitsQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  // RTK Caching
  describe('RTK Query Caching', () => {
    it('should cache results correctly for getUnits', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { topLevelUic: 'TEST_UIC' };

      const { result } = renderHook(() => unitsApi.useGetUnitsQuery(queryParam), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const { result: result2 } = renderHook(() => unitsApi.useGetUnitsQuery(queryParam), {
        wrapper,
      });

      expect(result2.current.data).toEqual([mockUnitBriefDto].map(mapToIUnitBrief));
      expect(result2.current.isLoading).toBe(false);
    });

    it('should cache results correctly for getSimilarUnits', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'TEST_UIC' };

      const { result } = renderHook(() => unitsApi.useGetSimilarUnitsQuery(queryParam), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const { result: result2 } = renderHook(() => unitsApi.useGetSimilarUnitsQuery(queryParam), {
        wrapper,
      });

      expect(result2.current.data).toEqual(mockSimilarUnitsResponse.similar_units);
      expect(result2.current.isLoading).toBe(false);
    });

    it('should handle different query parameters separately', async () => {
      const wrapper = createWrapper(store);

      const queryParam1 = { topLevelUic: 'UIC1' };
      const queryParam2 = { topLevelUic: 'UIC2' };

      const { result: result1 } = renderHook(() => unitsApi.useGetUnitsQuery(queryParam1), {
        wrapper,
      });

      const { result: result2 } = renderHook(() => unitsApi.useGetUnitsQuery(queryParam2), {
        wrapper,
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
        expect(result2.current.isSuccess).toBe(true);
      });

      expect(result1.current.data).toEqual([mockUnitBriefDto].map(mapToIUnitBrief));
      expect(result2.current.data).toEqual([mockUnitBriefDto].map(mapToIUnitBrief));
    });
  });
});
