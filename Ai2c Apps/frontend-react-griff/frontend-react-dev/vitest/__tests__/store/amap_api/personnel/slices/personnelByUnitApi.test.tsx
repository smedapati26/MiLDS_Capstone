import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import { mockMaintainerStrengthMosAvailabilityList } from 'vitest/mocks/amap_api_handlers/personnel/mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { personnelByUnitApi } from '@store/amap_api/personnel/slices/personnelByUnitApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [personnelByUnitApi.reducerPath]: personnelByUnitApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(personnelByUnitApi.middleware),
  });
};

describe('personnelByUnitApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(personnelByUnitApi.reducerPath).toBe('amapPersonnelUnitApi');
    });

    it('should have correct base query configuration', () => {
      expect(personnelByUnitApi.endpoints).toBeDefined();
      expect(Object.keys(personnelByUnitApi.endpoints)).toHaveLength(2);
    });

    it('should export all expected hooks', () => {
      expect(personnelByUnitApi.useGetMaintainerExperienceMosQuery).toBeDefined();
      expect(personnelByUnitApi.useGetMaintainerStrengthMosQuery).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(personnelByUnitApi.reducerPath);
    });
  });

  describe('useGetMaintainerExperienceMosQuery', () => {
    // SUCCESS - 200
    // it('should successfully fetch maintainer experience by MOS', async () => {
    //   const wrapper = createWrapper(store);

    //   const { result } = renderHook(
    //     () =>
    //       personnelByUnitApi.useGetMaintainerExperienceMosQuery({
    //         uic: 'TEST_UIC',
    //         MOSs: ['11B', '12A'],
    //       }),
    //     {
    //       wrapper,
    //     },
    //   );

    //   await waitFor(() => {
    //     expect(result.current.isSuccess).toBe(true);
    //   });

    //   expect(result.current.data).toBeDefined();
    //   expect(Object.keys(result.current.data!)).toHaveLength(2);
    //   expect(result.current.data!['11B']).toBeDefined();
    //   expect(result.current.data!['12A']).toBeDefined();
    //   expect(result.current.error).toBeUndefined();
    // });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () =>
          personnelByUnitApi.useGetMaintainerExperienceMosQuery({
            uic: 'TEST_UIC',
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
          personnelByUnitApi.useGetMaintainerExperienceMosQuery({
            uic: 'TEST_UIC',
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
          personnelByUnitApi.useGetMaintainerExperienceMosQuery({
            uic: 'TEST_UIC',
          }),
        {
          wrapper,
        },
      );

      // Should immediately have data from cache
      expect(result2.current.data).toBeDefined();
      expect(result2.current.isLoading).toBe(false);
    });

    // ERROR - 404 NOT_FOUND
    it('should handle when UIC not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () =>
          personnelByUnitApi.useGetMaintainerExperienceMosQuery({
            uic: 'not-found',
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
          personnelByUnitApi.useGetMaintainerExperienceMosQuery({
            uic: 'server-error',
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

    // NO DATA
    it('should handle no data response', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () =>
          personnelByUnitApi.useGetMaintainerExperienceMosQuery({
            uic: 'no-data',
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({});
    });
  });

  describe('useGetMaintainerStrengthMosQuery', () => {
    // SUCCESS - 200
    it('should successfully fetch maintainer strength by MOS', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () =>
          personnelByUnitApi.useGetMaintainerStrengthMosQuery({
            uic: 'TEST_UIC',
            ranks: ['E4', 'E5'],
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMaintainerStrengthMosAvailabilityList);
      expect(result.current.error).toBeUndefined();
    });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () =>
          personnelByUnitApi.useGetMaintainerStrengthMosQuery({
            uic: 'TEST_UIC',
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

    // ERROR - 404 NOT_FOUND
    it('should handle when UIC not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () =>
          personnelByUnitApi.useGetMaintainerStrengthMosQuery({
            uic: 'not-found',
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
          personnelByUnitApi.useGetMaintainerStrengthMosQuery({
            uic: 'server-error',
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

    // NO DATA
    it('should handle no data response', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () =>
          personnelByUnitApi.useGetMaintainerStrengthMosQuery({
            uic: 'no-data',
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });
});
