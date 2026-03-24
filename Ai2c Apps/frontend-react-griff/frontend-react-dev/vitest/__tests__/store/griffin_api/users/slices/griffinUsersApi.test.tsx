import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import { GRIFFIN_MOCK_BASE_URL } from 'vitest/mocks/griffin_api_handlers/users/handlers';
import {
  mockAppUser,
  mockCreatedUser,
  mockCreateUserPayload,
  mockElevatedRoles,
  mockUpdatedUser,
} from 'vitest/mocks/griffin_api_handlers/users/mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { griffinUsersApi } from '@store/griffin_api/users/slices/griffinUsersApi';

vi.resetModules();

// Mock environment variable
vi.mock('@store/griffin_api/base_urls', () => ({
  GRIFFIN_USER_BASE_URL: GRIFFIN_MOCK_BASE_URL,
}));

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [griffinUsersApi.reducerPath]: griffinUsersApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(griffinUsersApi.middleware),
  });
};

describe('griffinUsersApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(griffinUsersApi.reducerPath).toBe('griffinUsersApi');
    });

    it('should have correct base query configuration', () => {
      expect(griffinUsersApi.endpoints).toBeDefined();
      expect(Object.keys(griffinUsersApi.endpoints)).toHaveLength(4);
    });

    it('should export all expected hooks', () => {
      expect(griffinUsersApi.useCreateUserMutation).toBeDefined();
      expect(griffinUsersApi.useGetUserQuery).toBeDefined();
      expect(griffinUsersApi.useUpdateUserMutation).toBeDefined();
      expect(griffinUsersApi.useGetUserElevatedRolesQuery).toBeDefined();
    });
  });

  describe('createUser mutation', () => {
    it('should successfully create a user', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useCreateUserMutation(), {
        wrapper,
      });

      const [createUser] = result.current;

      const response = await createUser(mockCreateUserPayload);

      expect(response.data).toEqual(mockCreatedUser);
      expect('error' in response).toBe(false);
    });

    it('should handle validation errors', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useCreateUserMutation(), {
        wrapper,
      });

      const [createUser] = result.current;

      // Pass invalid data (null)
      const response = await createUser(null as unknown as typeof mockCreateUserPayload);

      expect('error' in response).toBe(true);
      if ('error' in response) {
        expect(response.error).toBeDefined();
      }
    });

    it('should handle server errors', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useCreateUserMutation(), {
        wrapper,
      });

      const [createUser] = result.current;

      const errorPayload = { ...mockCreateUserPayload, user_id: 'error-test' };
      const response = await createUser(errorPayload);

      expect('error' in response).toBe(true);
      if ('error' in response) {
        expect(response.error).toBeDefined();
      }
    });

    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useCreateUserMutation(), {
        wrapper,
      });

      const [createUser, { isLoading: initialLoading }] = result.current;
      expect(initialLoading).toBe(false);

      const response = await createUser(mockCreateUserPayload);

      // Check that the request completed successfully
      expect(response.data).toEqual(mockCreatedUser);
      expect('error' in response).toBe(false);

      // Check final loading state
      await waitFor(() => {
        const [, { isLoading }] = result.current;
        expect(isLoading).toBe(false);
      });
    });
  });

  // SUCCESS - 200
  describe('getUser query', () => {
    it('should successfully fetch a user', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useGetUserQuery({ userId: '0123456789' }), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAppUser);
      expect(result.current.error).toBeUndefined();
    });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useGetUserQuery({ userId: '0123456789' }), { wrapper });

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
      const { result: result1 } = renderHook(() => griffinUsersApi.useGetUserQuery({ userId: '0123456789' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      // Second query with same parameters should use cache
      const { result: result2 } = renderHook(() => griffinUsersApi.useGetUserQuery({ userId: '0123456789' }), {
        wrapper,
      });

      // Should immediately have data from cache
      expect(result2.current.data).toEqual(mockAppUser);
      expect(result2.current.isLoading).toBe(false);
    });

    // ERROR - 404 NOT_FOUND
    it('should handle user not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useGetUserQuery({ userId: 'not-found' }), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    // ERROR - 500 SERVER_ERROR
    it('should handle server errors', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useGetUserQuery({ userId: 'server-error' }), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('updateUser mutation', () => {
    it('should successfully update a user', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useUpdateUserMutation(), {
        wrapper,
      });

      const [updateUser] = result.current;

      const response = await updateUser(mockUpdatedUser);

      expect(response.data).toEqual(mockUpdatedUser);
      expect('error' in response).toBe(false);
    });

    it('should handle user not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useUpdateUserMutation(), {
        wrapper,
      });

      const [updateUser] = result.current;

      const response = await updateUser({
        ...mockUpdatedUser,
        userId: 'not-found',
      });

      expect('error' in response).toBe(true);
      if ('error' in response) {
        expect(response.error).toBeDefined();
      }
    });

    it('should handle validation errors', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useUpdateUserMutation(), {
        wrapper,
      });

      const [updateUser] = result.current;

      const response = await updateUser(null as unknown as typeof mockUpdatedUser);

      expect('error' in response).toBe(true);
      if ('error' in response) {
        expect(response.error).toBeDefined();
      }
    });

    it('should handle server errors', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useUpdateUserMutation(), {
        wrapper,
      });

      const [updateUser] = result.current;

      const response = await updateUser({
        ...mockUpdatedUser,
        userId: 'server-error',
      });

      expect('error' in response).toBe(true);
      if ('error' in response) {
        expect(response.error).toBeDefined();
      }
    });

    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useUpdateUserMutation(), {
        wrapper,
      });

      const [updateUser, { isLoading: initialLoading }] = result.current;
      expect(initialLoading).toBe(false);

      const response = await updateUser(mockUpdatedUser);

      // Check that the request completed successfully
      expect(response.data).toEqual(mockUpdatedUser);
      expect('error' in response).toBe(false);

      // Check final loading state
      await waitFor(() => {
        const [, { isLoading }] = result.current;
        expect(isLoading).toBe(false);
      });
    });
  });

  describe('getUserElevatedRoles query', () => {
    it('should successfully fetch user elevated roles', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useGetUserElevatedRolesQuery('0123456789'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockElevatedRoles);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle user not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useGetUserElevatedRolesQuery('not-found'), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('should handle server errors', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useGetUserElevatedRolesQuery('server-error'), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should return empty roles for users with no elevated roles', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useGetUserElevatedRolesQuery('no-roles'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({ admin: [], write: [] });
    });

    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useGetUserElevatedRolesQuery('0123456789'), { wrapper });

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
      const { result: result1 } = renderHook(() => griffinUsersApi.useGetUserElevatedRolesQuery('0123456789'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      // Second query with same parameters should use cache
      const { result: result2 } = renderHook(() => griffinUsersApi.useGetUserElevatedRolesQuery('0123456789'), {
        wrapper,
      });

      expect(result2.current.data).toEqual(mockElevatedRoles);
      expect(result2.current.isLoading).toBe(false);
    });
  });

  describe('RTK Query Integration', () => {
    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(griffinUsersApi.reducerPath);
    });

    it('should handle multiple concurrent requests', async () => {
      const wrapper = createWrapper(store);

      const { result: result1 } = renderHook(() => griffinUsersApi.useGetUserQuery({ userId: '0123456789' }), {
        wrapper,
      });

      const { result: result2 } = renderHook(() => griffinUsersApi.useGetUserElevatedRolesQuery('0123456789'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
        expect(result2.current.isSuccess).toBe(true);
      });

      expect(result1.current.data).toEqual(mockAppUser);
      expect(result2.current.data).toEqual(mockElevatedRoles);
    });
  });

  describe('Error Handling', () => {
    it('should provide detailed error information', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => griffinUsersApi.useGetUserQuery({ userId: 'not-found' }), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);
    });

    it('should handle network errors gracefully', async () => {
      const wrapper = createWrapper(store);

      // Mock a network error by using an invalid endpoint
      const { result } = renderHook(() => griffinUsersApi.useCreateUserMutation(), {
        wrapper,
      });

      const [createUser] = result.current;

      // This should trigger our MSW error handler
      const response = await createUser({ ...mockCreateUserPayload, user_id: 'error-test' });

      expect('error' in response).toBe(true);
    });
  });
});
