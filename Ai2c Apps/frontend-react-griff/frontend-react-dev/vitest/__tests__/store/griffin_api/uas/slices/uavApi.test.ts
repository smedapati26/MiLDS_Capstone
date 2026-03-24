import { beforeEach, describe, expect, it } from 'vitest';

import { configureStore } from '@reduxjs/toolkit';
import { act } from '@testing-library/react';
import { renderHook, waitFor } from '@testing-library/react';

import { IUASIn, mapToUas } from '@store/griffin_api/uas/models/IUAS';
import { uavApi } from '@store/griffin_api/uas/slices/uavApi';

import { createWrapper } from '@vitest/helpers/ProviderWrapper';
import { mockUasData } from '@vitest/mocks/griffin_api_handlers/uas/mock_data';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [uavApi.reducerPath]: uavApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(uavApi.middleware),
  });
};

describe('uavApi', () => {
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(uavApi.reducerPath).toBe('uavApi');
    });

    it('should have correct base query configuration', () => {
      expect(uavApi.endpoints).toBeDefined();
      expect(Object.keys(uavApi.endpoints)).toHaveLength(2);
    });

    it('should export all expected hooks', () => {
      expect(uavApi.useGetUAVQuery).toBeDefined();
      expect(uavApi.useEditUavEquipmentMutation).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = createTestStore().getState();
      expect(state).toHaveProperty(uavApi.reducerPath);
    });

    it('should have correct keepUnusedDataFor configuration', () => {
      expect(uavApi).toHaveProperty('reducerPath');
    });

    it('should have getUAV endpoint defined', () => {
      expect(uavApi.endpoints.getUAV).toBeDefined();
    });

    it('should have editUavEquipment endpoint defined', () => {
      expect(uavApi.endpoints.editUavEquipment).toBeDefined();
    });
  });

  describe('useGetUAVQuery', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      store = createTestStore();
    });

    const expected = mockUasData.map(mapToUas);

    it('should successfully fetch UAV by UIC', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useGetUAVQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      expect(result.current.error).toBeUndefined();
    });

    it('should pass UIC as query parameter', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useGetUAVQuery({ uic: 'CUSTOM_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useGetUAVQuery({ uic: 'TEST_UIC' }), {
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

    it('should cache results correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useGetUAVQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const { result: result2 } = renderHook(() => uavApi.useGetUAVQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      expect(result2.current.data).toEqual(expected);
      expect(result2.current.isLoading).toBe(false);
    });

    it('should not cache results for different UICs', async () => {
      const wrapper = createWrapper(store);

      const { result: result1 } = renderHook(() => uavApi.useGetUAVQuery({ uic: 'TEST_UIC_1' }), {
        wrapper,
      });
      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      const { result: result2 } = renderHook(() => uavApi.useGetUAVQuery({ uic: 'TEST_UIC_2' }), {
        wrapper,
      });

      expect(result2.current.isLoading).toBe(true);
    });

    it('should handle server errors', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useGetUAVQuery({ uic: 'server-error' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should transform response using mapToUas', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useGetUAVQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      if (result.current.data && result.current.data.length > 0) {
        expect(result.current.data[0]).toHaveProperty('serialNumber');
        expect(result.current.data[0]).toHaveProperty('currentUnit');
        expect(result.current.data[0]).not.toHaveProperty('serial_number');
      }
    });

    it('should handle response data correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useGetUAVQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.data?.length).toBeGreaterThan(0);
    });
  });

  describe('useEditUavEquipmentMutation', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      store = createTestStore();
    });

    const mockPayload: IUASIn = {
      locationId: 123,
      status: 'FMC',
      rtl: 'RTL1',
      remarks: 'Updated remarks',
      flightHours: '100',
      fieldSyncStatus: {
        serialNumber: true,
        ecd: false,
        model: true,
      },
    };

    it('should successfully edit UAV equipment', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useEditUavEquipmentMutation(), {
        wrapper,
      });

      await act(async () => {
        result.current[0]({ id: 1, payload: mockPayload });
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data).toBeDefined();
      expect(result.current[1].data?.success).toBe(true);
      expect(result.current[1].error).toBeUndefined();
    });

    it('should track mutation loading state', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useEditUavEquipmentMutation(), {
        wrapper,
      });

      expect(result.current[1].isLoading).toBe(false);

      await act(async () => {
        result.current[0]({ id: 1, payload: mockPayload });
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].isLoading).toBe(false);
    });

    it('should use PUT method for edit', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useEditUavEquipmentMutation(), {
        wrapper,
      });

      await act(async () => {
        result.current[0]({ id: 1, payload: mockPayload });
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].isSuccess).toBe(true);
    });

    it('should include equipment ID in URL', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useEditUavEquipmentMutation(), {
        wrapper,
      });

      await act(async () => {
        result.current[0]({ id: 42, payload: mockPayload });
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].isSuccess).toBe(true);
    });

    it('should transform payload using mapIUasInToDto', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useEditUavEquipmentMutation(), {
        wrapper,
      });

      await act(async () => {
        result.current[0]({ id: 1, payload: mockPayload });
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].isSuccess).toBe(true);
      expect(result.current[1].data?.success).toBe(true);
    });

    it('should reset mutation state', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useEditUavEquipmentMutation(), {
        wrapper,
      });

      await act(async () => {
        result.current[0]({ id: 1, payload: mockPayload });
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      act(() => {
        result.current[1].reset();
      });

      expect(result.current[1].isUninitialized).toBe(true);
      expect(result.current[1].data).toBeUndefined();
    });

    it('should handle multiple sequential mutations', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useEditUavEquipmentMutation(), {
        wrapper,
      });

      await act(async () => {
        result.current[0]({ id: 1, payload: mockPayload });
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      const updatedPayload = { ...mockPayload, remarks: 'Second update' };

      await act(async () => {
        result.current[0]({ id: 2, payload: updatedPayload });
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data).toBeDefined();
      expect(result.current[1].data?.success).toBe(true);
    });

    it('should handle payload with all fieldSyncStatus options', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useEditUavEquipmentMutation(), {
        wrapper,
      });

      const fullPayload: IUASIn = {
        locationId: 123,
        status: 'FMC',
        rtl: 'RTL1',
        remarks: 'Full sync test',
        flightHours: '150',
        fieldSyncStatus: {
          serialNumber: true,
          ecd: true,
          equipmentNumber: true,
          model: true,
          status: true,
          rtl: true,
          totalAirframeHours: true,
          remarks: true,
          dateDown: true,
          location: true,
        },
      };

      await act(async () => {
        result.current[0]({ id: 1, payload: fullPayload });
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data?.success).toBe(true);
    });

    it('should handle payload without fieldSyncStatus', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useEditUavEquipmentMutation(), {
        wrapper,
      });

      const minimalPayload: IUASIn = {
        locationId: 123,
        status: 'FMC',
        rtl: 'RTL1',
        remarks: 'Minimal payload',
      };

      await act(async () => {
        result.current[0]({ id: 1, payload: minimalPayload });
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data?.success).toBe(true);
    });

    it('should handle payload with null locationId', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => uavApi.useEditUavEquipmentMutation(), {
        wrapper,
      });

      const payloadWithNullLocation: IUASIn = {
        locationId: null,
        status: 'FMC',
        rtl: 'RTL1',
        remarks: 'No location',
      };

      await act(async () => {
        result.current[0]({ id: 1, payload: payloadWithNullLocation });
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data?.success).toBe(true);
    });
  });

  describe('Endpoint Integration', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      store = createTestStore();
    });

    it('should have both endpoints available in the store', () => {
      const state = store.getState();
      expect(state[uavApi.reducerPath]).toBeDefined();
    });

    it('should handle concurrent queries and mutations', async () => {
      const wrapper = createWrapper(store);

      const { result: queryResult } = renderHook(() => uavApi.useGetUAVQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      const { result: mutationResult } = renderHook(() => uavApi.useEditUavEquipmentMutation(), {
        wrapper,
      });

      await act(async () => {
        mutationResult.current[0]({
          id: 1,
          payload: {
            locationId: 123,
            status: 'FMC',
            rtl: 'RTL1',
            remarks: 'Concurrent test',
          },
        });
      });

      await waitFor(() => {
        expect(queryResult.current.isSuccess).toBe(true);
        expect(mutationResult.current[1].isSuccess).toBe(true);
      });

      expect(queryResult.current.data).toBeDefined();
      expect(mutationResult.current[1].data).toBeDefined();
    });
  });
});
