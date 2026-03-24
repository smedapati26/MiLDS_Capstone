import { describe, expect, it } from 'vitest';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { Echelon } from '@ai2c/pmx-mui';

import { ITaskforceDto } from '@store/griffin_api/taskforce/models/ITaskforce';
import { mapToUserEquipments } from '@store/griffin_api/taskforce/models/IUserEquipment';
import { taskforceApi } from '@store/griffin_api/taskforce/slices/taskforceApi';

import { createWrapper } from '@vitest/helpers/ProviderWrapper';
import { mockUserEquipment } from '@vitest/mocks/griffin_api_handlers/taskforce/mock_data';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [taskforceApi.reducerPath]: taskforceApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(taskforceApi.middleware),
  });
};

describe('taskforceApi', () => {
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(taskforceApi.reducerPath).toBe('taskforceApi');
    });

    it('should have correct base query configuration', () => {
      expect(taskforceApi.endpoints).toBeDefined();
      expect(Object.keys(taskforceApi.endpoints)).toHaveLength(7);
    });

    it('should export all expected hooks', () => {
      expect(taskforceApi.useGetUserEquipmentQuery).toBeDefined();
      expect(taskforceApi.useCreateTaskforceMutation).toBeDefined();
      expect(taskforceApi.useGetTaskforcesQuery).toBeDefined();
      expect(taskforceApi.useGetTaskforceDetailsQuery).toBeDefined();
      expect(taskforceApi.useUpdateTaskforceUnitMutation).toBeDefined();
      expect(taskforceApi.useUpdateTaskforceEquipmentMutation).toBeDefined();
      expect(taskforceApi.useDeleteTaskforceMutation).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = createTestStore().getState();
      expect(state).toHaveProperty(taskforceApi.reducerPath);
    });
  });

  describe('useGetUserEquipmentQuery', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      store = createTestStore();
    });

    const expected = mapToUserEquipments(mockUserEquipment);

    it('should successfully fetch UAC by UIC', async () => {
      const wrapper = createWrapper(store);
      const { result } = renderHook(() => taskforceApi.useGetUserEquipmentQuery(undefined), {
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

      const { result } = renderHook(() => taskforceApi.useGetUserEquipmentQuery(undefined), {
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
      const { result } = renderHook(() => taskforceApi.useGetUserEquipmentQuery(undefined), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Second query with same parameters should use cache
      const { result: result2 } = renderHook(() => taskforceApi.useGetUserEquipmentQuery(undefined), {
        wrapper,
      });

      // Should immediately have data from cache
      expect(result2.current.data).toEqual(expected);
      expect(result2.current.isLoading).toBe(false);
    });
  });

  describe('useCreateTaskforceMutation', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      store = createTestStore();
    });

    const payload: ITaskforceDto = {
      tf_name: 'TEST_NAME',
      short_name: 'TEST_SHORT_NAME',
      nick_name: 'NICKNAME',
      echelon: Echelon.COMPANY,
      owner_user_id: '123',
      slogan: 'SLOGAN',
      tf_start_date: '01-01-2026',
      tf_end_date: '01-01-2027',
      location_id: 123,
      aircraft: ['111', '222', '333'],
      uas: ['111', '222', '333'],
      agse: ['111', '222', '333'],
      subordinates: [],
    };

    it('should successfully create a taskforce', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => taskforceApi.useCreateTaskforceMutation(), {
        wrapper,
      });

      const [createTaskforce] = result.current;

      const response = await createTaskforce(payload);

      expect('error' in response).toBe(false);
    });

    it('should handle validation errors', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => taskforceApi.useCreateTaskforceMutation(), {
        wrapper,
      });

      const [createTaskforce] = result.current;

      // Pass invalid data (null)
      const response = await createTaskforce(null as unknown);

      expect('error' in response).toBe(true);
      if ('error' in response) {
        expect(response.error).toBeDefined();
      }
    });

    it('should handle server errors', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => taskforceApi.useCreateTaskforceMutation(), {
        wrapper,
      });

      const [createTaskforce] = result.current;

      const errorPayload = { ...payload, name: 'error-test' };
      const response = await createTaskforce(errorPayload);

      expect('error' in response).toBe(true);
      if ('error' in response) {
        expect(response.error).toBeDefined();
      }
    });

    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => taskforceApi.useCreateTaskforceMutation(), {
        wrapper,
      });

      const [createTaskforce, { isLoading: initialLoading }] = result.current;
      expect(initialLoading).toBe(false);

      await createTaskforce(payload);

      // Check final loading state
      await waitFor(() => {
        const [, { isLoading }] = result.current;
        expect(isLoading).toBe(false);
      });
    });
  });
});
