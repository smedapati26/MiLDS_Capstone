import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import {
  mockMaintenanceEventDto,
  mockUpcomingMaintenanceDto,
} from 'vitest/mocks/griffin_api_handlers/events/mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { mapToIMaintenanceEvent, mapToIUpcomingMaintenance } from '@store/griffin_api/events/models/IMaintenanceEvent';
import { maintenanceApi } from '@store/griffin_api/events/slices/maintenanceApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [maintenanceApi.reducerPath]: maintenanceApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(maintenanceApi.middleware),
  });
};

describe('maintenanceApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(maintenanceApi.reducerPath).toBe('eventsMaintenanceApi');
    });

    it('should have correct base query configuration', () => {
      expect(maintenanceApi.endpoints).toBeDefined();
      expect(Object.keys(maintenanceApi.endpoints)).toHaveLength(6);
    });

    it('should export all expected hooks', () => {
      expect(maintenanceApi.useGetMaintenanceQuery).toBeDefined();
      expect(maintenanceApi.useGetMaintenanceEventQuery).toBeDefined();
      expect(maintenanceApi.useGetUpcomingMaintenanceQuery).toBeDefined();
      expect(maintenanceApi.useAddMaintenanceEventMutation).toBeDefined();
      expect(maintenanceApi.useUpdateMaintenanceEventMutation).toBeDefined();
      expect(maintenanceApi.useDeleteMaintenanceEventMutation).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(maintenanceApi.reducerPath);
    });
  });

  describe('useGetMaintenanceQuery', () => {
    const queryParam = { uic: 'TEST_UIC', startDate: '2023-01-01', endDate: '2023-01-31' };
    const expected = [mockMaintenanceEventDto].map(mapToIMaintenanceEvent);

    // SUCCESS - 200
    it('should successfully fetch maintenance data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => maintenanceApi.useGetMaintenanceQuery(queryParam), {
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

      const { result } = renderHook(() => maintenanceApi.useGetMaintenanceQuery(queryParam), {
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

      const { result } = renderHook(() => maintenanceApi.useGetMaintenanceQuery(queryParam), {
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

      const { result } = renderHook(() => maintenanceApi.useGetMaintenanceQuery(queryParam), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const { result: result2 } = renderHook(() => maintenanceApi.useGetMaintenanceQuery(queryParam), {
        wrapper,
      });

      expect(result2.current.data).toEqual(expected);
      expect(result2.current.isLoading).toBe(false);
    });

    it('should handle different query parameters separately', async () => {
      const wrapper = createWrapper(store);

      const queryParam1 = { uic: 'UIC1', startDate: '2023-01-01', endDate: '2023-01-31' };
      const queryParam2 = { uic: 'UIC2', startDate: '2023-01-01', endDate: '2023-01-31' };

      const { result: result1 } = renderHook(() => maintenanceApi.useGetMaintenanceQuery(queryParam1), {
        wrapper,
      });

      const { result: result2 } = renderHook(() => maintenanceApi.useGetMaintenanceQuery(queryParam2), {
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

  describe('useGetMaintenanceEventQuery', () => {
    const eventId = '1';
    const expected = mapToIMaintenanceEvent(mockMaintenanceEventDto);

    it('should successfully fetch maintenance event data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => maintenanceApi.useGetMaintenanceEventQuery({ eventId }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      expect(result.current.error).toBeUndefined();
    });

    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => maintenanceApi.useGetMaintenanceEventQuery({ eventId }), {
        wrapper,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useGetUpcomingMaintenanceQuery', () => {
    const queryParam = { event_end: '2023-12-31' };
    const expected = [mockUpcomingMaintenanceDto].map(mapToIUpcomingMaintenance);

    it('should successfully fetch upcoming maintenance data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => maintenanceApi.useGetUpcomingMaintenanceQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle query with uic parameter', async () => {
      const wrapper = createWrapper(store);
      const paramWithUic = { uic: 'TEST_UIC', event_end: '2023-12-31' };

      const { result } = renderHook(() => maintenanceApi.useGetUpcomingMaintenanceQuery(paramWithUic), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
    });

    it('should handle query with other_uics parameter', async () => {
      const wrapper = createWrapper(store);
      const paramWithOtherUics = { other_uics: ['UIC1', 'UIC2'], event_end: '2023-12-31' };

      const { result } = renderHook(() => maintenanceApi.useGetUpcomingMaintenanceQuery(paramWithOtherUics), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
    });

    it('should handle query with is_phase parameter', async () => {
      const wrapper = createWrapper(store);
      const paramWithPhase = { event_end: '2023-12-31', is_phase: true };

      const { result } = renderHook(() => maintenanceApi.useGetUpcomingMaintenanceQuery(paramWithPhase), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
    });

    it('should handle query with serial parameter', async () => {
      const wrapper = createWrapper(store);
      const paramWithSerial = { event_end: '2023-12-31', serial: '12345' };

      const { result } = renderHook(() => maintenanceApi.useGetUpcomingMaintenanceQuery(paramWithSerial), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
    });
  });

  // ERROR HANDLING
  describe('Error Handling', () => {
    describe('useGetMaintenanceQuery', () => {
      it('should handle UIC not found error', async () => {
        const wrapper = createWrapper(store);
        const queryParam = { uic: 'not-found', startDate: '2023-01-01', endDate: '2023-01-31' };

        const { result } = renderHook(() => maintenanceApi.useGetMaintenanceQuery(queryParam), {
          wrapper,
        });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeDefined();
        expect(result.current.data).toBeUndefined();
      });
    });

    describe('useGetMaintenanceEventQuery', () => {
      it('should handle event not found error', async () => {
        const wrapper = createWrapper(store);
        const eventId = 'not-found';

        const { result } = renderHook(() => maintenanceApi.useGetMaintenanceEventQuery({ eventId }), {
          wrapper,
        });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeDefined();
        expect(result.current.data).toBeUndefined();
      });

      it('should handle server error', async () => {
        const wrapper = createWrapper(store);
        const eventId = 'server-error';

        const { result } = renderHook(() => maintenanceApi.useGetMaintenanceEventQuery({ eventId }), {
          wrapper,
        });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeDefined();
        expect(result.current.data).toBeUndefined();
      });
    });

    describe('useGetUpcomingMaintenanceQuery', () => {
      it('should handle UIC not found error', async () => {
        const wrapper = createWrapper(store);
        const queryParam = { uic: 'not-found', event_end: '2023-12-31' };

        const { result } = renderHook(() => maintenanceApi.useGetUpcomingMaintenanceQuery(queryParam), {
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
        const queryParam = { uic: 'server-error', event_end: '2023-12-31' };

        const { result } = renderHook(() => maintenanceApi.useGetUpcomingMaintenanceQuery(queryParam), {
          wrapper,
        });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeDefined();
        expect(result.current.data).toBeUndefined();
      });
    });
  });

  // RESPONSE TRANSFORMATION
  describe('Response Transformation', () => {
    it('should transform getMaintenance response correctly', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'TEST_UIC', startDate: '2023-01-01', endDate: '2023-01-31' };

      const { result } = renderHook(() => maintenanceApi.useGetMaintenanceQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);

      if (result.current.data && result.current.data.length > 0) {
        const event = result.current.data[0];
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('startDate');
        expect(event).toHaveProperty('endDate');
        expect(event).toHaveProperty('laneId');
        expect(event).toHaveProperty('maintenanceType');
        expect(event).toHaveProperty('aircraft');
        expect(event).toHaveProperty('isPhase');
      }
    });

    it('should transform getMaintenanceEvent response correctly', async () => {
      const wrapper = createWrapper(store);
      const eventId = '1';

      const { result } = renderHook(() => maintenanceApi.useGetMaintenanceEventQuery({ eventId }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toHaveProperty('id');
      expect(result.current.data).toHaveProperty('startDate');
      expect(result.current.data).toHaveProperty('endDate');
    });

    it('should transform getUpcomingMaintenance response correctly', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { event_end: '2023-12-31' };

      const { result } = renderHook(() => maintenanceApi.useGetUpcomingMaintenanceQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);

      if (result.current.data && result.current.data.length > 0) {
        const upcoming = result.current.data[0];
        expect(upcoming).toHaveProperty('id');
        expect(upcoming).toHaveProperty('title');
        expect(upcoming).toHaveProperty('progress');
        expect(upcoming).toHaveProperty('status');
        expect(upcoming).toHaveProperty('eventStart');
        expect(upcoming).toHaveProperty('eventEnd');
        expect(upcoming).toHaveProperty('serialNumber');
      }
    });
  });

  describe('useAddMaintenanceEventMutation', () => {
    it('should successfully add a maintenance event', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => maintenanceApi.useAddMaintenanceEventMutation(), {
        wrapper,
      });

      const newEvent = {
        aircraft_id: 'A1',
        lane_id: 1,
        inspection_reference_id: 1,
        maintenance_type: 'insp',
        event_start: '2023-01-01T00:00:00Z',
        event_end: '2023-01-02T00:00:00Z',
        notes: 'New event notes',
      };

      result.current[0](newEvent);

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data).toBeDefined();
      expect(result.current[1].data?.id).toBe(2);
    });
  });

  describe('useUpdateMaintenanceEventMutation', () => {
    it('should successfully update a maintenance event', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => maintenanceApi.useUpdateMaintenanceEventMutation(), {
        wrapper,
      });

      const updateData = {
        id: 1,
        aircraft_id: 'A1',
        lane_id: 1,
        maintenance_type: 'insp',
        event_start: '2023-01-01T00:00:00Z',
        event_end: '2023-01-02T00:00:00Z',
        notes: 'Updated notes',
      };

      result.current[0](updateData);

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });
    });
  });

  describe('useDeleteMaintenanceEventMutation', () => {
    it('should successfully delete a maintenance event', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => maintenanceApi.useDeleteMaintenanceEventMutation({}), {
        wrapper,
      });

      result.current[0](1);

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });
    });
  });
});
