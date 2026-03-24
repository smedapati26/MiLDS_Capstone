import { beforeEach, describe, expect, it } from 'vitest';

import { configureStore } from '@reduxjs/toolkit';

import { favoriteUnitsApi } from '@store/griffin_api/auto_dsr/slices/favoriteUnitsApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [favoriteUnitsApi.reducerPath]: favoriteUnitsApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(favoriteUnitsApi.middleware),
  });
};

describe('favoriteUnitsApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(favoriteUnitsApi.reducerPath).toBe('favoriteUnitsApi');
    });

    it('should have correct base query configuration', () => {
      expect(favoriteUnitsApi.endpoints).toBeDefined();
      expect(Object.keys(favoriteUnitsApi.endpoints)).toHaveLength(3);
    });

    it('should export all expected hooks', () => {
      expect(favoriteUnitsApi.useGetFavoriteUnitsQuery).toBeDefined();
      expect(favoriteUnitsApi.useAddFavoriteUnitsMutation).toBeDefined();
      expect(favoriteUnitsApi.useRemoveFavoriteUnitsMutation).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(favoriteUnitsApi.reducerPath);
    });
  });

  // describe('useGetFavoriteUnitsQuery', () => {
  //   const queryParam = { userId: '0123456789' };
  //   const expected = [mockUnitBriefDto].map(mapToIUnitBrief);

  //   it('should successfully fetch units data', async () => {
  //     const wrapper = createWrapper(store);

  //     const { result } = renderHook(() => favoriteUnitsApi.useGetFavoriteUnitsQuery(queryParam), {
  //       wrapper,
  //     });

  //     await waitFor(() => {
  //       expect(result.current.isSuccess).toBe(true);
  //     });

  //     expect(result.current.data).toEqual(expected);
  //     expect(result.current.error).toBeUndefined();
  //   });

  //   it('should pass correct query parameters', async () => {
  //     const wrapper = createWrapper(store);

  //     const { result } = renderHook(() => favoriteUnitsApi.useGetFavoriteUnitsQuery(queryParam), {
  //       wrapper,
  //     });

  //     await waitFor(() => {
  //       expect(result.current.isSuccess).toBe(true);
  //     });

  //     expect(result.current.data).toBeDefined();
  //     expect(result.current.data).toEqual(expected);
  //   });

  //   it('should track loading state correctly', async () => {
  //     const wrapper = createWrapper(store);

  //     const { result } = renderHook(() => favoriteUnitsApi.useGetFavoriteUnitsQuery(queryParam), {
  //       wrapper,
  //     });

  //     expect(result.current.isLoading).toBe(true);
  //     expect(result.current.isFetching).toBe(true);

  //     await waitFor(() => {
  //       expect(result.current.isLoading).toBe(false);
  //       expect(result.current.isFetching).toBe(false);
  //       expect(result.current.isSuccess).toBe(true);
  //     });
  //   });
      
  //   it('should handle user id not found error', async () => {
  //     const wrapper = createWrapper(store);
  //     const queryParam = { userId: 'not-found' };

  //     const { result } = renderHook(() => favoriteUnitsApi.useGetFavoriteUnitsQuery(queryParam), {
  //       wrapper,
  //     });

  //     await waitFor(() => {
  //       expect(result.current.isError).toBe(true);
  //     });

  //     expect(result.current.error).toBeDefined();
  //     expect(result.current.data).toBeUndefined();
  //   });
  // });

  // // ERROR HANDLING
  // describe('Error Handling', () => {
  //   it('should handle server errors for useGetFavoriteUnitsQuery', async () => {
  //     const wrapper = createWrapper(store);
  //     const queryParam = { userId: 'server-error' };

  //     const { result } = renderHook(() => favoriteUnitsApi.useGetFavoriteUnitsQuery(queryParam), {
  //       wrapper,
  //     });

  //     await waitFor(() => {
  //       expect(result.current.isError).toBe(true);
  //     });

  //     expect(result.current.error).toBeDefined();
  //     expect(result.current.data).toBeUndefined();
  //   });
  // });
});
