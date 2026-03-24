import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import {
  mockCrewExperienceReadinessLevelTransformed,
  mockCrewExperienceSkill,
  mockCrewStrengthMos,
  mockCrewStrengthSkills,
  mockPersonnelSkills,
} from 'vitest/mocks/griffin_api_handlers/personnel/mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { personnelApi } from '@store/griffin_api/personnel/slices/personnelApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [personnelApi.reducerPath]: personnelApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(personnelApi.middleware),
  });
};

describe('personnelApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(personnelApi.reducerPath).toBe('personnelApi');
    });

    it('should have correct base query configuration', () => {
      expect(personnelApi.endpoints).toBeDefined();
      expect(Object.keys(personnelApi.endpoints)).toHaveLength(5);
    });

    it('should export all expected hooks', () => {
      expect(personnelApi.useGetCrewExperienceSkillQuery).toBeDefined();
      expect(personnelApi.useGetCrewExperienceReadinessLevelQuery).toBeDefined();
      expect(personnelApi.useGetPersonnelSkillsQuery).toBeDefined();
      expect(personnelApi.useGetCrewStrengthMosQuery).toBeDefined();
      expect(personnelApi.useGetCrewStrengthSkillsQuery).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(personnelApi.reducerPath);
    });
  });

  describe('getCrewExperienceSkill query', () => {
    // SUCCESS - 200
    it('should successfully fetch crew experience skills', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => personnelApi.useGetCrewExperienceSkillQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([mockCrewExperienceSkill]);
      expect(result.current.error).toBeUndefined();
    });

    // IS_LOADING
    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => personnelApi.useGetCrewExperienceSkillQuery({ uic: 'TEST_UIC' }), {
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
      const { result } = renderHook(() => personnelApi.useGetCrewExperienceSkillQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Second query with same parameters should use cache
      const { result: result2 } = renderHook(() => personnelApi.useGetCrewExperienceSkillQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      // Should immediately have data from cache
      expect(result2.current.data).toEqual([mockCrewExperienceSkill]);
      expect(result2.current.isLoading).toBe(false);
    });

    // ERROR - 404 NOT_FOUND
    it('should handle UIC not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => personnelApi.useGetCrewExperienceSkillQuery({ uic: 'not-found' }), {
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

      const { result } = renderHook(() => personnelApi.useGetCrewExperienceSkillQuery({ uic: 'server-error' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('getCrewExperienceReadinessLevel query', () => {
    it('should successfully fetch and transform crew experience readiness level', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => personnelApi.useGetCrewExperienceReadinessLevelQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCrewExperienceReadinessLevelTransformed);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle UIC not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => personnelApi.useGetCrewExperienceReadinessLevelQuery({ uic: 'not-found' }), {
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

      const { result } = renderHook(
        () => personnelApi.useGetCrewExperienceReadinessLevelQuery({ uic: 'server-error' }),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('getPersonnelSkills query', () => {
    it('should successfully fetch personnel skills', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => personnelApi.useGetPersonnelSkillsQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPersonnelSkills);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle UIC not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => personnelApi.useGetPersonnelSkillsQuery({ uic: 'not-found' }), {
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

      const { result } = renderHook(() => personnelApi.useGetPersonnelSkillsQuery({ uic: 'server-error' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('getCrewStrengthSkills query', () => {
    it('should successfully fetch crew strength skills', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => personnelApi.useGetCrewStrengthSkillsQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCrewStrengthSkills);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle UIC not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => personnelApi.useGetCrewStrengthSkillsQuery({ uic: 'not-found' }), {
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

      const { result } = renderHook(() => personnelApi.useGetCrewStrengthSkillsQuery({ uic: 'server-error' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('getCrewStrengthMos query', () => {
    it('should successfully fetch crew strength MOS', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => personnelApi.useGetCrewStrengthMosQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCrewStrengthMos);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle UIC not found', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => personnelApi.useGetCrewStrengthMosQuery({ uic: 'not-found' }), {
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

      const { result } = renderHook(() => personnelApi.useGetCrewStrengthMosQuery({ uic: 'server-error' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('RTK Query Integration', () => {
    it('should handle multiple concurrent requests', async () => {
      const wrapper = createWrapper(store);

      const { result: result1 } = renderHook(() => personnelApi.useGetCrewExperienceSkillQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      const { result: result2 } = renderHook(() => personnelApi.useGetCrewStrengthMosQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
        expect(result2.current.isSuccess).toBe(true);
      });

      expect(result1.current.data).toEqual([mockCrewExperienceSkill]);
      expect(result2.current.data).toEqual(mockCrewStrengthMos);
    });
  });
});
