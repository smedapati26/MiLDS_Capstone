/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import {
  mockAutoDsrDto,
  mockAutoDsrLocationDto,
  mockAutoDsrSingleUnitInfoDto,
} from 'vitest/mocks/griffin_api_handlers/auto_dsr/mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook, waitFor } from '@testing-library/react';

import { mapToAutoDsrSingleUnitInfo, mapToIAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';
import { autoDsrApi } from '@store/griffin_api/auto_dsr/slices/autoDsrApi';
import { transformAutoDsr } from '@store/griffin_api/auto_dsr/transforms/autoDsrTransform';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [autoDsrApi.reducerPath]: autoDsrApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(autoDsrApi.middleware),
  });
};

describe('autoDsrApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(autoDsrApi.reducerPath).toBe('autoDsrApi');
    });

    it('should have correct base query configuration', () => {
      expect(autoDsrApi.endpoints).toBeDefined();
      expect(Object.keys(autoDsrApi.endpoints)).toHaveLength(8);
    });

    it('should export all expected hooks', () => {
      expect(autoDsrApi.useGetAutoDsrQuery).toBeDefined();
      expect(autoDsrApi.useGetAutoDsrLocationQuery).toBeDefined();
      expect(autoDsrApi.useGetAutoDsrSingleUnitInfoQuery).toBeDefined();
      expect(autoDsrApi.useGetAcdUploadHistoryQuery).toBeDefined();
      expect(autoDsrApi.useGetAcdUploadLatestHistoryQuery).toBeDefined();
      expect(autoDsrApi.useUploadAcdMutation).toBeDefined();
      expect(autoDsrApi.useCancelAcdUploadMutation).toBeDefined();
      expect(autoDsrApi.useDownloadAcdFileMutation).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(autoDsrApi.reducerPath);
    });
  });

  describe('useGetAutoDsrQuery', () => {
    const queryParam = { uic: 'TEST_UIC' };
    const expected = transformAutoDsr([mockAutoDsrDto]);

    it('should successfully fetch auto DSR data', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => autoDsrApi.useGetAutoDsrQuery(queryParam), {
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

      const { result } = renderHook(() => autoDsrApi.useGetAutoDsrQuery(queryParam), {
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

      const { result } = renderHook(() => autoDsrApi.useGetAutoDsrQuery(queryParam), {
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

      const { result } = renderHook(() => autoDsrApi.useGetAutoDsrQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('should fetch auto_dsr data', async () => {
      const queryParam = { name: 'name' };
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => autoDsrApi.useGetAutoDsrQuery(queryParam), {
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
    it('should handle server errors for getAutoDsr', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'server-error' };

      const { result } = renderHook(() => autoDsrApi.useGetAutoDsrQuery(queryParam), {
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
    it('should cache results correctly for getAutoDsr', async () => {
      const wrapper = createWrapper(store);
      const queryParam = { uic: 'TEST_UIC' };

      const { result } = renderHook(() => autoDsrApi.useGetAutoDsrQuery(queryParam), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const { result: result2 } = renderHook(() => autoDsrApi.useGetAutoDsrQuery(queryParam), {
        wrapper,
      });

      expect(result2.current.data).toEqual(transformAutoDsr([mockAutoDsrDto]));
      expect(result2.current.isLoading).toBe(false);
    });

    it('should handle different query parameters separately', async () => {
      const wrapper = createWrapper(store);

      const queryParam1 = { uic: 'UIC1' };
      const queryParam2 = { uic: 'UIC2' };

      const { result: result1 } = renderHook(() => autoDsrApi.useGetAutoDsrQuery(queryParam1), {
        wrapper,
      });

      const { result: result2 } = renderHook(() => autoDsrApi.useGetAutoDsrQuery(queryParam2), {
        wrapper,
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
        expect(result2.current.isSuccess).toBe(true);
      });

      expect(result1.current.data).toEqual(transformAutoDsr([mockAutoDsrDto]));
      expect(result2.current.data).toEqual(transformAutoDsr([mockAutoDsrDto]));
    });
  });

  describe('useGetAutoDsrLocationQuery', () => {
    const queryParam = { name: 'TestLocation', code: 'TST', limit: 10, offset: 0 };
    const expected = {
      items: mockAutoDsrLocationDto.map(mapToIAutoDsrLocation),
    };

    it('should fetch location data successfully', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => autoDsrApi.useGetAutoDsrLocationQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle error for invalid location', async () => {
      const wrapper = createWrapper(store);
      const errorParam = { name: 'not-found', code: 'not-found', limit: 10, offset: 0 };

      const { result } = renderHook(() => autoDsrApi.useGetAutoDsrLocationQuery(errorParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('should handle empty result', async () => {
      const wrapper = createWrapper(store);
      const emptyParam = { name: 'empty', code: 'empty', limit: 10, offset: 0 };

      const { result } = renderHook(() => autoDsrApi.useGetAutoDsrLocationQuery(emptyParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.items).toEqual([]);
    });
  });

  describe('useGetAutoDsrSingleUnitInfoQuery', () => {
    const queryParam = { uic: 'TEST_UIC' };
    const expected = mapToAutoDsrSingleUnitInfo(mockAutoDsrSingleUnitInfoDto);

    it('should fetch single unit info successfully', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => autoDsrApi.useGetAutoDsrSingleUnitInfoQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle error for invalid UIC', async () => {
      const wrapper = createWrapper(store);
      const errorParam = { uic: 'not-found' };

      const { result } = renderHook(() => autoDsrApi.useGetAutoDsrSingleUnitInfoQuery(errorParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('should handle edge case: empty similar units', async () => {
      const wrapper = createWrapper(store);
      const emptyParam = { uic: 'empty-similar-units' };

      const { result } = renderHook(() => autoDsrApi.useGetAutoDsrSingleUnitInfoQuery(emptyParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.similarUnits).toEqual([]);
    });
  });
  describe('useGetAcdUploadHistoryQuery', () => {
    const queryParam = { uic: 'TEST_UIC' };

    it('should fetch ACD upload history successfully', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => autoDsrApi.useGetAcdUploadHistoryQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.items).toBeDefined();
      expect(Array.isArray(result.current.data?.items)).toBe(true);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle search parameter', async () => {
      const wrapper = createWrapper(store);
      const searchParam = { uic: 'TEST_UIC', search: 'ACD_2026' };

      const { result } = renderHook(() => autoDsrApi.useGetAcdUploadHistoryQuery(searchParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.items).toBeDefined();
    });

    it('should handle error for invalid UIC', async () => {
      const wrapper = createWrapper(store);
      const errorParam = { uic: 'not-found' };

      const { result } = renderHook(() => autoDsrApi.useGetAcdUploadHistoryQuery(errorParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should handle server error', async () => {
      const wrapper = createWrapper(store);
      const errorParam = { uic: 'server-error' };

      const { result } = renderHook(() => autoDsrApi.useGetAcdUploadHistoryQuery(errorParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useGetAcdUploadLatestHistoryQuery', () => {
    const queryParam = { uic: 'TEST_UIC' };

    it('should fetch latest ACD upload history successfully', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => autoDsrApi.useGetAcdUploadLatestHistoryQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.id).toBeDefined();
      expect(result.current.data?.fileName).toBeDefined();
      expect(result.current.error).toBeUndefined();
    });

    it('should handle error for invalid UIC', async () => {
      const wrapper = createWrapper(store);
      const errorParam = { uic: 'not-found' };

      const { result } = renderHook(() => autoDsrApi.useGetAcdUploadLatestHistoryQuery(errorParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should handle server error', async () => {
      const wrapper = createWrapper(store);
      const errorParam = { uic: 'server-error' };

      const { result } = renderHook(() => autoDsrApi.useGetAcdUploadLatestHistoryQuery(errorParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useUploadAcdMutation', () => {
    it('should upload ACD file successfully', async () => {
      const wrapper = createWrapper(store);
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      const { result } = renderHook(() => autoDsrApi.useUploadAcdMutation(), {
        wrapper,
      });

      const uploadParams = {
        uic: 'TEST_UIC',
        sync: false,
        processFile: true,
        acdFile: mockFile,
      };

      result.current[0](uploadParams);

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data).toBeDefined();
      expect(result.current[1].data?.message).toBe('ACD file uploaded successfully');
      expect(result.current[1].data?.export_id).toBeDefined();
    });

    it('should handle upload error for invalid UIC', async () => {
      const wrapper = createWrapper(store);
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      const { result } = renderHook(() => autoDsrApi.useUploadAcdMutation(), {
        wrapper,
      });

      const uploadParams = {
        uic: 'not-found',
        sync: false,
        processFile: true,
        acdFile: mockFile,
      };

      result.current[0](uploadParams);

      await waitFor(() => {
        expect(result.current[1].isError).toBe(true);
      });

      expect(result.current[1].error).toBeDefined();
    });

    it('should handle server error during upload', async () => {
      const wrapper = createWrapper(store);
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      const { result } = renderHook(() => autoDsrApi.useUploadAcdMutation(), {
        wrapper,
      });

      const uploadParams = {
        uic: 'server-error',
        sync: false,
        processFile: true,
        acdFile: mockFile,
      };

      result.current[0](uploadParams);

      await waitFor(() => {
        expect(result.current[1].isError).toBe(true);
      });

      expect(result.current[1].error).toBeDefined();
    });
  });

  describe('useCancelAcdUploadMutation', () => {
    it('should cancel ACD upload successfully', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => autoDsrApi.useCancelAcdUploadMutation(), {
        wrapper,
      });

      result.current[0]({ id: 123 });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBe(true);
      });

      expect(result.current[1].data).toBeDefined();
      expect(result.current[1].data?.message).toBe('ACD upload cancelled successfully');
    });

    it('should handle error for invalid upload ID', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => autoDsrApi.useCancelAcdUploadMutation(), {
        wrapper,
      });

      result.current[0]({ id: 'not-found' });

      await waitFor(() => {
        expect(result.current[1].isError).toBe(true);
      });

      expect(result.current[1].error).toBeDefined();
    });

    it('should handle server error during cancellation', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => autoDsrApi.useCancelAcdUploadMutation(), {
        wrapper,
      });

      result.current[0]({ id: 'server-error' });

      await waitFor(() => {
        expect(result.current[1].isError).toBe(true);
      });

      expect(result.current[1].error).toBeDefined();
    });
  });

  describe('useDownloadAcdFileMutation', () => {
    beforeEach(() => {
      // Mock URL.createObjectURL and URL.revokeObjectURL
      global.URL.createObjectURL = vi.fn(() => 'mock-url');
      global.URL.revokeObjectURL = vi.fn();

      // Mock document methods
      const mockLink = document.createElement('a');
      mockLink.click = vi.fn();
      mockLink.href = '';
      mockLink.download = '';

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should trigger download successfully', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => autoDsrApi.useDownloadAcdFileMutation(), {
        wrapper,
      });

      let mutationResult;
      await act(async () => {
        mutationResult = await result.current[0]({ id: 1, fileName: 'test-file.txt' });
      });

      // Since the mutation returns void, check that it completed without error
      expect(result.current[1].isLoading).toBe(false);
      expect(result.current[1].isError).toBe(false);
      expect(mutationResult).toBeDefined();

      // Verify download was triggered
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should handle error for invalid file ID', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => autoDsrApi.useDownloadAcdFileMutation(), {
        wrapper,
      });

      await act(async () => {
        try {
          await result.current[0]({ id: 999999, fileName: 'test-file.txt' }).unwrap();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current[1].isError).toBe(true);
      expect(result.current[1].error).toBeDefined();
    });

    it('should handle server error during download', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => autoDsrApi.useDownloadAcdFileMutation(), {
        wrapper,
      });

      await act(async () => {
        try {
          await result.current[0]({ id: -1, fileName: 'test-file.txt' }).unwrap();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current[1].isError).toBe(true);
      expect(result.current[1].error).toBeDefined();
    });

    it('should use default filename when not provided', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => autoDsrApi.useDownloadAcdFileMutation(), {
        wrapper,
      });

      let mutationResult;
      await act(async () => {
        mutationResult = await result.current[0]({ id: 1 });
      });

      expect(result.current[1].isLoading).toBe(false);
      expect(result.current[1].isError).toBe(false);
      expect(mutationResult).toBeDefined();
    });
  });
});
