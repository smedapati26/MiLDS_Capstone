import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import { mockMaintenanceLaneDto } from 'vitest/mocks/griffin_api_handlers/events/mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { lanesApi } from '@store/griffin_api/events/slices/lanesApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [lanesApi.reducerPath]: lanesApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(lanesApi.middleware),
  });
};

describe('lanesApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(lanesApi.reducerPath).toBe('eventsLanesApi');
    });

    it('should have correct base query configuration', () => {
      expect(lanesApi.endpoints).toBeDefined();
      expect(Object.keys(lanesApi.endpoints)).toHaveLength(4);
    });

    it('should export all expected hooks', () => {
      expect(lanesApi.useGetLanesQuery).toBeDefined();
      expect(lanesApi.useAddLaneMutation).toBeDefined();
      expect(lanesApi.useDeleteLaneMutation).toBeDefined();
      expect(lanesApi.useUpdateLaneMutation).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(lanesApi.reducerPath);
    });
  });

  describe('useGetLanesQuery', () => {
    const queryParam = 'TEST_UIC';
    const expected = [mockMaintenanceLaneDto].map((dto) => ({
      id: dto.id,
      location: dto.location
        ? { name: dto.location.name, shortName: dto.location.short_name, code: dto.location.code }
        : null,
      name: dto.name,
      unitUic: dto.unit,
      airframeFamilies: dto.airframe_families,
      subordinateUnits: dto.subordinate_units,
      isContractor: dto.contractor || false,
      isInternal: dto.internal || false,
    }));

    // SUCCESS - 200
    it('should successfully fetch lanes data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => lanesApi.useGetLanesQuery(queryParam), {
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

      const { result } = renderHook(() => lanesApi.useGetLanesQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toEqual(expected);
    });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => lanesApi.useGetLanesQuery(queryParam), {
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

    // RTK Caching
    it('should cache results correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => lanesApi.useGetLanesQuery(queryParam), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const { result: result2 } = renderHook(() => lanesApi.useGetLanesQuery(queryParam), {
        wrapper,
      });

      expect(result2.current.data).toEqual(expected);
      expect(result2.current.isLoading).toBe(false);
    });

    it('should handle different query parameters separately', async () => {
      const wrapper = createWrapper(store);

      const queryParam1 = 'UIC1';
      const queryParam2 = 'UIC2';

      const { result: result1 } = renderHook(() => lanesApi.useGetLanesQuery(queryParam1), {
        wrapper,
      });

      const { result: result2 } = renderHook(() => lanesApi.useGetLanesQuery(queryParam2), {
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
    it('should handle UIC not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParam = 'not-found';

      const { result } = renderHook(() => lanesApi.useGetLanesQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('should handle server errors', async () => {
      const wrapper = createWrapper(store);
      const queryParam = 'server-error';

      const { result } = renderHook(() => lanesApi.useGetLanesQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  // RESPONSE TRANSFORMATION
  describe('Response Transformation', () => {
    it('should transform response correctly', async () => {
      const wrapper = createWrapper(store);
      const queryParam = 'TEST_UIC';

      const { result } = renderHook(() => lanesApi.useGetLanesQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);

      if (result.current.data && result.current.data.length > 0) {
        const lane = result.current.data[0];
        expect(lane).toHaveProperty('id');
        expect(lane).toHaveProperty('name');
        expect(lane).toHaveProperty('unitUic');
        expect(lane).toHaveProperty('airframeFamilies');
        expect(lane).toHaveProperty('subordinateUnits');
        expect(lane).toHaveProperty('location');
        expect(lane).toHaveProperty('isContractor');
        expect(lane).toHaveProperty('isInternal');
      }
    });
  });

  describe('useAddLaneMutation', () => {
    it('should successfully add a lane', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => lanesApi.useAddLaneMutation(), {
        wrapper,
      });

      const newLane = {
        name: 'New Lane',
        unit_id: 'TEST_UIC',
        airframes: ['F-35'],
        location_id: null,
        contractor: false,
        internal: true,
      };

      result.current[0](newLane);

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data).toBeDefined();
      expect(result.current[1].data?.id).toBe(2);
      expect(result.current[1].data?.name).toBe('New Lane');
    });

    it('should handle invalid data error', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => lanesApi.useAddLaneMutation(), {
        wrapper,
      });

      const invalidLane = {};

      result.current[0](invalidLane);

      await waitFor(() => {
        expect(result.current[1].isError).toBe(true);
      });

      expect(result.current[1].error).toBeDefined();
    });
  });

  describe('useDeleteLaneMutation', () => {
    it('should successfully delete a lane', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => lanesApi.useDeleteLaneMutation(), {
        wrapper,
      });

      result.current[0](1);

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data).toEqual({ success: true });
    });

    it('should handle lane not found error', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => lanesApi.useDeleteLaneMutation(), {
        wrapper,
      });

      result.current[0]('not-found');

      await waitFor(() => {
        expect(result.current[1].isError).toBe(true);
      });

      expect(result.current[1].error).toBeDefined();
    });

    it('should handle server error', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => lanesApi.useDeleteLaneMutation(), {
        wrapper,
      });

      result.current[0]('server-error');

      await waitFor(() => {
        expect(result.current[1].isError).toBe(true);
      });

      expect(result.current[1].error).toBeDefined();
    });
  });

  describe('useUpdateLaneMutation', () => {
    it('should successfully update a lane', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => lanesApi.useUpdateLaneMutation(), {
        wrapper,
      });

      const updateData = { id: 1, name: 'Updated Lane' };

      result.current[0](updateData);

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data).toBeDefined();
      expect(result.current[1].data?.id).toBe(1);
      expect(result.current[1].data?.name).toBe('Updated Lane');
    });

    it('should handle lane not found error', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => lanesApi.useUpdateLaneMutation(), {
        wrapper,
      });

      const updateData = { id: 'not-found', name: 'Updated' };

      result.current[0](updateData);

      await waitFor(() => {
        expect(result.current[1].isError).toBe(true);
      });

      expect(result.current[1].error).toBeDefined();
    });

    it('should handle server error', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => lanesApi.useUpdateLaneMutation(), {
        wrapper,
      });

      const updateData = { id: 'server-error', name: 'Updated' };

      result.current[0](updateData);

      await waitFor(() => {
        expect(result.current[1].isError).toBe(true);
      });

      expect(result.current[1].error).toBeDefined();
    });
  });
});
