import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import { mockMaintainerDtoList, mockPhaseTeamDto } from 'vitest/mocks/amap_api_handlers/personnel/mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { phaseTeamApi } from '@store/amap_api/personnel/slices/phaseTeamApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [phaseTeamApi.reducerPath]: phaseTeamApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(phaseTeamApi.middleware),
  });
};

describe('phaseTeamApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(phaseTeamApi.reducerPath).toBe('amapPhaseTeamApi');
    });

    it('should have correct base query configuration', () => {
      expect(phaseTeamApi.endpoints).toBeDefined();
      expect(Object.keys(phaseTeamApi.endpoints)).toHaveLength(4);
    });

    it('should export all expected hooks', () => {
      expect(phaseTeamApi.useGetMaintainersQuery).toBeDefined();
      expect(phaseTeamApi.useGetPhaseTeamQuery).toBeDefined();
      expect(phaseTeamApi.useAddPhaseTeamMutation).toBeDefined();
      expect(phaseTeamApi.useUpdatePhaseTeamMutation).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(phaseTeamApi.reducerPath);
    });
  });

  describe('useGetMaintainersQuery', () => {
    // SUCCESS - 200
    it('should successfully fetch maintainers', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () =>
          phaseTeamApi.useGetMaintainersQuery({
            uic: 'TEST_UIC',
            start_date: '2023-01-01',
            end_date: '2023-12-31',
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMaintainerDtoList);
      expect(result.current.error).toBeUndefined();
    });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () =>
          phaseTeamApi.useGetMaintainersQuery({
            uic: 'TEST_UIC',
            start_date: '2023-01-01',
            end_date: '2023-12-31',
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
          phaseTeamApi.useGetMaintainersQuery({
            uic: 'TEST_UIC',
            start_date: '2023-01-01',
            end_date: '2023-12-31',
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
          phaseTeamApi.useGetMaintainersQuery({
            uic: 'TEST_UIC',
            start_date: '2023-01-01',
            end_date: '2023-12-31',
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
          phaseTeamApi.useGetMaintainersQuery({
            uic: 'not-found',
            start_date: '2023-01-01',
            end_date: '2023-12-31',
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
          phaseTeamApi.useGetMaintainersQuery({
            uic: 'server-error',
            start_date: '2023-01-01',
            end_date: '2023-12-31',
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
          phaseTeamApi.useGetMaintainersQuery({
            uic: 'no-data',
            start_date: '2023-01-01',
            end_date: '2023-12-31',
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

  describe('useGetPhaseTeamQuery', () => {
    // SUCCESS - 200
    it('should successfully fetch phase team', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () =>
          phaseTeamApi.useGetPhaseTeamQuery({
            phaseId: 123,
          }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPhaseTeamDto);
      expect(result.current.error).toBeUndefined();
    });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(
        () =>
          phaseTeamApi.useGetPhaseTeamQuery({
            phaseId: 123,
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
          phaseTeamApi.useGetPhaseTeamQuery({
            phaseId: 123,
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
          phaseTeamApi.useGetPhaseTeamQuery({
            phaseId: 123,
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
    it('should handle when phase not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => phaseTeamApi.useGetPhaseTeamQuery({ phaseId: '888' }), {
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

      const { result } = renderHook(() => phaseTeamApi.useGetPhaseTeamQuery({ phaseId: '888' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useAddPhaseTeamMutation', () => {
    // SUCCESS - 200
    it('should successfully add phase team', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => phaseTeamApi.useAddPhaseTeamMutation(), {
        wrapper,
      });

      const [addPhaseTeam] = result.current;

      await addPhaseTeam({
        phaseId: 123,
        phase_members: ['user123', 'user456'],
        phase_lead_user_id: 'user123',
        assistant_phase_lead_user_id: 'user456',
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].error).toBeUndefined();
    });

    // ERROR - 404 NOT_FOUND
    it('should handle when phase not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => phaseTeamApi.useAddPhaseTeamMutation(), {
        wrapper,
      });

      const [addPhaseTeam] = result.current;

      await addPhaseTeam({
        phaseId: 999, // Use a number that triggers not-found
        phase_members: ['user123'],
        phase_lead_user_id: 'user123',
        assistant_phase_lead_user_id: 'user456',
      });

      await waitFor(() => {
        expect(result.current[1].isError).toBe(true);
      });

      expect(result.current[1].error).toBeDefined();
    });

    // ERROR - 500 SERVER_ERROR
    it('should handle server errors', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => phaseTeamApi.useAddPhaseTeamMutation(), {
        wrapper,
      });

      const [addPhaseTeam] = result.current;

      await addPhaseTeam({
        phaseId: 888, // Use a number that triggers server-error
        phase_members: ['user123'],
        phase_lead_user_id: 'user123',
        assistant_phase_lead_user_id: 'user456',
      });

      await waitFor(() => {
        expect(result.current[1].isError).toBe(true);
      });

      expect(result.current[1].error).toBeDefined();
    });
  });

  describe('useUpdatePhaseTeamMutation', () => {
    // SUCCESS - 200
    it('should successfully update phase team', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => phaseTeamApi.useUpdatePhaseTeamMutation(), {
        wrapper,
      });

      const [updatePhaseTeam] = result.current;

      await updatePhaseTeam({
        phaseId: 123,
        phase_members: ['user123', 'user456'],
        phase_lead_user_id: 'user123',
        assistant_phase_lead_user_id: 'user456',
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].error).toBeUndefined();
    });

    // ERROR - 404 NOT_FOUND
    it('should handle when phase not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => phaseTeamApi.useUpdatePhaseTeamMutation(), {
        wrapper,
      });

      const [updatePhaseTeam] = result.current;

      await updatePhaseTeam({
        phaseId: 999, // Use a number that triggers not-found
        phase_members: ['user123'],
        phase_lead_user_id: 'user123',
        assistant_phase_lead_user_id: 'user456',
      });

      await waitFor(() => {
        expect(result.current[1].isError).toBe(true);
      });

      expect(result.current[1].error).toBeDefined();
    });

    // ERROR - 500 SERVER_ERROR
    it('should handle server errors', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => phaseTeamApi.useUpdatePhaseTeamMutation(), {
        wrapper,
      });

      const [updatePhaseTeam] = result.current;

      await updatePhaseTeam({
        phaseId: 888, // Use a number that triggers server-error
        phase_members: ['user123'],
        phase_lead_user_id: 'user123',
        assistant_phase_lead_user_id: 'user456',
      });

      await waitFor(() => {
        expect(result.current[1].isError).toBe(true);
      });

      expect(result.current[1].error).toBeDefined();
    });
  });
});
