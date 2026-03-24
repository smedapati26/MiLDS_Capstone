import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import {
  mockAircraftRiskPrediction,
  mockComponentRiskPrediction,
  mockFailureCountDto,
  mockLongevity,
  mockPartListItem,
  mockShortLifeComponentDto,
  mockSurvivalPredictionDto,
} from 'vitest/mocks/griffin_api_handlers/components/mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { mapToIFailureCount, mapToIShortLife } from '@store/griffin_api/components/models';
import { componentsApi } from '@store/griffin_api/components/slices/componentsApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [componentsApi.reducerPath]: componentsApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(componentsApi.middleware),
  });
};

describe('componentsApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(componentsApi.reducerPath).toBe('componentsApi');
    });

    it('should have correct base query configuration', () => {
      expect(componentsApi.endpoints).toBeDefined();
      expect(Object.keys(componentsApi.endpoints)).toHaveLength(10);
    });

    it('should export all expected hooks', () => {
      expect(componentsApi.useGetShortLifeQuery).toBeDefined();
      expect(componentsApi.useGetFailureCountQuery).toBeDefined();
      expect(componentsApi.useExportChecklistMutation).toBeDefined();
      expect(componentsApi.useGetSurvivalPredictionsQuery).toBeDefined();
      expect(componentsApi.useGetAircraftRiskPredictionsQuery).toBeDefined();
      expect(componentsApi.useGetComponentFailurePredictionsQuery).toBeDefined();
      expect(componentsApi.useGetComponentPartListQuery).toBeDefined();
      expect(componentsApi.useGetComponentRiskQuery).toBeDefined();
      expect(componentsApi.useGetModelRiskPredictionsQuery).toBeDefined();
      expect(componentsApi.useGetLongevityQuery).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(componentsApi.reducerPath);
    });
  });

  describe('useGetShortLifeQuery', () => {
    const queryParam = { uic: 'TEST_UIC', include_na: 'false' };
    const expected = [mockShortLifeComponentDto].map(mapToIShortLife);

    it('should successfully fetch short life data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => componentsApi.useGetShortLifeQuery(queryParam), {
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

      const { result } = renderHook(() => componentsApi.useGetShortLifeQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data).toEqual(expected);
    });

    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => componentsApi.useGetShortLifeQuery(queryParam), {
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

    it('should handle UIC not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'not-found', include_na: 'false' };

      const { result } = renderHook(() => componentsApi.useGetShortLifeQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useGetFailureCountQuery', () => {
    const queryParam = { uic: 'TEST_UIC', hour: 100, failure_percentage: 0.25 };
    const expected = [mockFailureCountDto].map(mapToIFailureCount);

    it('should successfully fetch failure count data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => componentsApi.useGetFailureCountQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle UIC not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'not-found', hour: 100 };

      const { result } = renderHook(() => componentsApi.useGetFailureCountQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useExportChecklistMutation', () => {
    it('should successfully export checklist', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => componentsApi.useExportChecklistMutation(), {
        wrapper,
      });

      result.current[0]({});

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data).toBeDefined();
    });
  });

  describe('useGetSurvivalPredictionsQuery', () => {
    const queryParam = { uic: 'TEST_UIC', startDate: '2023-01-01', endDate: '2023-01-31' };
    const expected = [mockSurvivalPredictionDto];

    it('should successfully fetch survival predictions data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => componentsApi.useGetSurvivalPredictionsQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle UIC not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'not-found', startDate: '2023-01-01', endDate: '2023-01-31' };

      const { result } = renderHook(() => componentsApi.useGetSurvivalPredictionsQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useGetAircraftRiskPredictionsQuery', () => {
    const queryParam = {
      uic: 'TEST_UIC',
      variant: 'top' as const,
      serial_numbers: ['12345'],
      other_uics: [],
      part_numbers: [],
    };
    const expected = [mockAircraftRiskPrediction];

    it('should successfully fetch aircraft risk predictions data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => componentsApi.useGetAircraftRiskPredictionsQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle UIC not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParam = {
        uic: 'not-found',
        variant: 'top' as const,
        serial_numbers: ['12345'],
        other_uics: [],
        part_numbers: [],
      };

      const { result } = renderHook(() => componentsApi.useGetAircraftRiskPredictionsQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useGetComponentFailurePredictionsQuery', () => {
    const queryParam = { aircraft: ['12345'], horizon: 30 };
    const expected = [mockComponentRiskPrediction];

    it('should successfully fetch component failure predictions data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => componentsApi.useGetComponentFailurePredictionsQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('useGetComponentPartListQuery', () => {
    const queryParam = { uic: 'TEST_UIC', serial: '12345' };
    const expected = [mockPartListItem];

    it('should successfully fetch component part list data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => componentsApi.useGetComponentPartListQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle UIC not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'not-found', serial: '12345' };

      const { result } = renderHook(() => componentsApi.useGetComponentPartListQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useGetComponentRiskQuery', () => {
    const queryParam = {
      uic: 'TEST_UIC',
      variant: 'top' as const,
      serial_numbers: ['12345'],
      part_numbers: ['PN123'],
      other_uics: [],
      serial: '12345',
    };
    const expected = [mockComponentRiskPrediction];

    it('should successfully fetch component risk data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => componentsApi.useGetComponentRiskQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle UIC not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParam = {
        uic: 'not-found',
        variant: 'top' as const,
        serial_numbers: ['12345'],
        part_numbers: ['PN123'],
        other_uics: [],
        serial: '12345',
      };

      const { result } = renderHook(() => componentsApi.useGetComponentRiskQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useGetModelRiskPredictionsQuery', () => {
    const queryParam = { uic: 'TEST_UIC', part_number: 'PN123' };
    const expected = [mockAircraftRiskPrediction];

    it('should successfully fetch model risk predictions data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => componentsApi.useGetModelRiskPredictionsQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle UIC not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'not-found', part_number: 'PN123' };

      const { result } = renderHook(() => componentsApi.useGetModelRiskPredictionsQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('should handle part number not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'TEST_UIC', part_number: 'not-found' };

      const { result } = renderHook(() => componentsApi.useGetModelRiskPredictionsQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useGetLongevityQuery', () => {
    const queryParam = { uic: 'TEST_UIC', part_number: 'PN123' };
    const expected = mockLongevity;

    it('should successfully fetch longevity data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => componentsApi.useGetLongevityQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle UIC not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'not-found', part_number: 'PN123' };

      const { result } = renderHook(() => componentsApi.useGetLongevityQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('should handle part number not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'TEST_UIC', part_number: 'not-found' };

      const { result } = renderHook(() => componentsApi.useGetLongevityQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  // ERROR HANDLING
  describe('Error Handling', () => {
    it('should handle server errors for getShortLife', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'server-error', include_na: 'false' };

      const { result } = renderHook(() => componentsApi.useGetShortLifeQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('should handle server errors for getFailureCount', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'server-error', hour: 100 };

      const { result } = renderHook(() => componentsApi.useGetFailureCountQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  // RTK Caching
  describe('RTK Query Caching', () => {
    it('should cache results correctly for getShortLife', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'TEST_UIC', include_na: 'false' };

      const { result } = renderHook(() => componentsApi.useGetShortLifeQuery(queryParam), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const { result: result2 } = renderHook(() => componentsApi.useGetShortLifeQuery(queryParam), {
        wrapper,
      });

      expect(result2.current.data).toEqual([mockShortLifeComponentDto].map(mapToIShortLife));
      expect(result2.current.isLoading).toBe(false);
    });

    it('should handle different query parameters separately', async () => {
      const wrapper = createWrapper(store);

      const queryParam1 = { uic: 'UIC1', include_na: 'false' };
      const queryParam2 = { uic: 'UIC2', include_na: 'true' };

      const { result: result1 } = renderHook(() => componentsApi.useGetShortLifeQuery(queryParam1), {
        wrapper,
      });

      const { result: result2 } = renderHook(() => componentsApi.useGetShortLifeQuery(queryParam2), {
        wrapper,
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
        expect(result2.current.isSuccess).toBe(true);
      });

      expect(result1.current.data).toEqual([mockShortLifeComponentDto].map(mapToIShortLife));
      expect(result2.current.data).toEqual([mockShortLifeComponentDto].map(mapToIShortLife));
    });
  });
});
