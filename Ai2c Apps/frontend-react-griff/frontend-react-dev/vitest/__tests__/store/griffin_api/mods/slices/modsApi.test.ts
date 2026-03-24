import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import { IModification, IModificationEditInDto, IModificationEditOut, INewModificationDto, mapToIModification, mapToIModificationEditOut, mapToMods, TrackingVariableOptions } from '@store/griffin_api/mods/models';
import { modsApi } from '@store/griffin_api/mods/slices';

import { mockModificationEditOutDto, mockModificationModels, mockModificationsDto, mockModsDto } from '@vitest/mocks/griffin_api_handlers/mods/mock_data';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [modsApi.reducerPath]: modsApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(modsApi.middleware),
  });
};

describe('modsApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('API Slice configuration', () => {
    it('should have correct reducer path', () => {
      expect(modsApi.reducerPath).toBe('modsApi');
    });

    it('should have correct base query configuration', () => {
      expect(modsApi.endpoints).toBeDefined();
      expect(Object.keys(modsApi.endpoints)).toHaveLength(6);
    });

    it('should export all expected hooks', () => {
      expect(modsApi.useGetSelectedModsByUicQuery).toBeDefined();
      expect(modsApi.useGetModificationTypesQuery).toBeDefined();
      expect(modsApi.useGetModificationsByUicQuery).toBeDefined();
      expect(modsApi.useAddNewModificationMutation).toBeDefined();
      expect(modsApi.useDeleteModificationMutation).toBeDefined();
      expect(modsApi.useEditModificationsMutation).toBeDefined();
    });

    it('should properly integrate with redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(modsApi.reducerPath);
    });
  });

  describe('useGetSelectedModsByUicQuery', () => {
    it('should successfully fetch mods by uic', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => modsApi.useGetSelectedModsByUicQuery('test'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const expected = mockModsDto.map(mapToMods);
      expect(result.current.data).toEqual(expected);
    });

    it('should track loading state', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => modsApi.useGetSelectedModsByUicQuery('test'), {
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
  });

  describe('useGetModificationTypesQuery', () => {
    it('should successfully fetch model types', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => modsApi.useGetModificationTypesQuery(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockModificationModels);
    });

    it('should track loading state', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => modsApi.useGetModificationTypesQuery(), {
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
  });

  describe('useGetModificationsByUicQuery', () => {
    it('should successfully fetch modifications for unit', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => modsApi.useGetModificationsByUicQuery('test'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const expected: IModification[] = mockModificationsDto.map(mapToIModification);
      expect(result.current.data).toEqual(expected);
    });

    it('should track loading state', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => modsApi.useGetModificationsByUicQuery('test'), {
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
  });
  
  describe('useEditModificationsMutation', () => {
    it('should successfully edit existing modifications', async () => {
      const wrapper = createWrapper(store);
            const { result } = renderHook(() => modsApi.useEditModificationsMutation(), {
              wrapper,
            });
      
            // Mock payload to send in the PATCH request
            const payload: IModificationEditInDto[] = [
              {
                id: 2,
                serial_number: 'serial2',
                model: 'model2',
                unit_uic: 'unit1',
                tracking_variable: TrackingVariableOptions.STATUS.value,
                value: 'NMC',
                location_id: 1,
                remarks: "Comments",
                assigned_aircraft: "aircraft1",
              },
            ];
      
            // Trigger the mutation
            const [editModifications] = result.current;
            const response = await editModifications(payload);
            const expected: IModificationEditOut = mapToIModificationEditOut(mockModificationEditOutDto);
            
            // Assert the response data
            expect(response.data).toEqual(expected);
      
            // Assert no error occurred
            expect(response.error).toBeUndefined();
    });
  });

  describe('useAddModificationMutation', () => {
    it('should successfully add new modification', async () => {
      const wrapper = createWrapper(store);
            const { result } = renderHook(() => modsApi.useAddNewModificationMutation(), {
              wrapper,
            });
      
            // Mock payload to send in the PATCH request
            const payload: INewModificationDto = {
              serial_number: 'serial5',
              model: 'model2',
              unit_uic: 'unit1',
              tracking_variable: TrackingVariableOptions.STATUS.value,
              value: 'NMC',
              remarks: 'Remark',
              assigned_aircraft: ["aircraft1"],
            };
      
            // Trigger the mutation
            const [addModification] = result.current;
            const response = await addModification(payload);
            
            // Assert the response data
            expect(response.data).toEqual({"success": true});
      
            // Assert no error occurred
            expect(response.error).toBeUndefined();
    });
  });

  describe('useDeleteModificationMutation', () => {
    it('should successfully add new modification', async () => {
      const wrapper = createWrapper(store);
      const { result } = renderHook(() => modsApi.useDeleteModificationMutation(), {
        wrapper,
      });
      
      // Trigger the mutation
      const [deleteModification] = result.current;
      const response = await deleteModification({modId: '1'});
      
      // Assert the response data
      expect(response.data).toEqual({"success": true});

      // Assert no error occurred
      expect(response.error).toBeUndefined();
    });
  });
});
