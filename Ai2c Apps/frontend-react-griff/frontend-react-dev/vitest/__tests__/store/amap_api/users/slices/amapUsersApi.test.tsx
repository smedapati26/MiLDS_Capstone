import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import { mockElevatedRoles } from 'vitest/mocks/amap_api_handlers/users/mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

vi.resetModules();

// Mock base URLs
vi.mock('@store/amap_api/base_urls', () => ({
  AMAP_USERS_BASE_URL: AMAP_MOCK_BASE_URL,
}));

import { AMAP_MOCK_BASE_URL } from 'vitest/mocks/amap_api_handlers/users/handlers';

import { amapUsersApi } from '@store/amap_api/users/slices/amapUsersApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [amapUsersApi.reducerPath]: amapUsersApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(amapUsersApi.middleware),
  });
};

describe('amapUsersApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(amapUsersApi.reducerPath).toBe('amapUsersApi');
    });

    it('should have correct base query configuration', () => {
      expect(amapUsersApi.endpoints).toBeDefined();
      expect(Object.keys(amapUsersApi.endpoints)).toHaveLength(1);
    });

    it('should export all expected hooks', () => {
      expect(amapUsersApi.useGetAmapUserElevatedRolesQuery).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(amapUsersApi.reducerPath);
    });
  });

  describe('getAmapUserElevatedRoles query', () => {
    it('should successfully fetch user elevated roles', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => amapUsersApi.useGetAmapUserElevatedRolesQuery('0123456789'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockElevatedRoles);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle user not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => amapUsersApi.useGetAmapUserElevatedRolesQuery('not-found'), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('should handle server errors', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => amapUsersApi.useGetAmapUserElevatedRolesQuery('server-error'), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should return empty roles for users with no elevated roles', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => amapUsersApi.useGetAmapUserElevatedRolesQuery('no-roles'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({
        viewer: [],
        recorder: [],
        manager: [],
      });
    });

    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => amapUsersApi.useGetAmapUserElevatedRolesQuery('0123456789'), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isFetching).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isFetching).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should cache results correctly', async () => {
      const wrapper = createWrapper(store);

      // First query
      const { result: result1 } = renderHook(() => amapUsersApi.useGetAmapUserElevatedRolesQuery('0123456789'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      // Second query with same parameters should use cache
      const { result: result2 } = renderHook(() => amapUsersApi.useGetAmapUserElevatedRolesQuery('0123456789'), {
        wrapper,
      });

      expect(result2.current.data).toEqual(mockElevatedRoles);
      expect(result2.current.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should provide detailed error information', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => amapUsersApi.useGetAmapUserElevatedRolesQuery('not-found'), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);
    });
  });
});
