import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import { mockBankTimeProjectionDto } from 'vitest/mocks/griffin_api_handlers/auto_dsr/mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { mapBankTimeForecast } from '@store/griffin_api/auto_dsr/models/IBankTimeForecastDto';
import { bankTimeForecastApi } from '@store/griffin_api/auto_dsr/slices/bankTimeForecastApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [bankTimeForecastApi.reducerPath]: bankTimeForecastApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(bankTimeForecastApi.middleware),
  });
};

describe('bankTimeForecastApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(bankTimeForecastApi.reducerPath).toBe('bankTimeForecastApi');
    });

    it('should have correct base query configuration', () => {
      expect(bankTimeForecastApi.endpoints).toBeDefined();
      expect(Object.keys(bankTimeForecastApi.endpoints)).toHaveLength(1);
    });

    it('should export all expected hooks', () => {
      expect(bankTimeForecastApi.useGetBankTimeQuery).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(bankTimeForecastApi.reducerPath);
    });
  });

  describe('useGetBankTimeQuery', () => {
    const queryParam = { uic: 'TEST_UIC' };
    const expected = mapBankTimeForecast(mockBankTimeProjectionDto);

    it('should successfully fetch bank time data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => bankTimeForecastApi.useGetBankTimeQuery(queryParam), {
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

      const { result } = renderHook(() => bankTimeForecastApi.useGetBankTimeQuery(queryParam), {
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

      const { result } = renderHook(() => bankTimeForecastApi.useGetBankTimeQuery(queryParam), {
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
      const queryParam = { uic: 'not-found' };

      const { result } = renderHook(() => bankTimeForecastApi.useGetBankTimeQuery(queryParam), {
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
    it('should handle server errors for getBankTime', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'server-error' };

      const { result } = renderHook(() => bankTimeForecastApi.useGetBankTimeQuery(queryParam), {
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
    const expected = mapBankTimeForecast(mockBankTimeProjectionDto);

    it('should cache results correctly for getBankTime', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'TEST_UIC' };

      const { result } = renderHook(() => bankTimeForecastApi.useGetBankTimeQuery(queryParam), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const { result: result2 } = renderHook(() => bankTimeForecastApi.useGetBankTimeQuery(queryParam), {
        wrapper,
      });

      expect(result2.current.data).toEqual(expected);
      expect(result2.current.isLoading).toBe(false);
    });

    it('should handle different query parameters separately', async () => {
      const wrapper = createWrapper(store);

      const queryParam1 = { uic: 'UIC1' };
      const queryParam2 = { uic: 'UIC2' };

      const { result: result1 } = renderHook(() => bankTimeForecastApi.useGetBankTimeQuery(queryParam1), {
        wrapper,
      });

      const { result: result2 } = renderHook(() => bankTimeForecastApi.useGetBankTimeQuery(queryParam2), {
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
});
