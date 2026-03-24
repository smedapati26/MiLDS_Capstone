import { beforeEach, describe, expect, it } from 'vitest';
import { createWrapper } from 'vitest/helpers/ProviderWrapper';
import {
  mockAircraftBankPercentageDto,
  mockAircraftCompanyDto,
  mockAircraftDsrDto,
  mockAircraftDto,
  mockAircraftPhaseFlowDto,
  mockAircraftPhaseFlowModelsDto,
  mockAircraftPhaseFlowSubordinatesDto,
} from 'vitest/mocks/griffin_api_handlers/aircraft/mock_data';

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';

import {
  IAircraftEditInDto,
  IAircraftEditOut,
  mapToAircraftPhaseFlowModels,
  mapToAircraftPhaseFlowSubordinates,
  mapToIAircraft,
  mapToIAircraftBankPercentage,
  mapToIAircraftCompany,
  mapToIAircraftInspection,
  mapToIAircraftPhaseFlow,
} from '@store/griffin_api/aircraft/models';
import { aircraftApi } from '@store/griffin_api/aircraft/slices/aircraftApi';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [aircraftApi.reducerPath]: aircraftApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(aircraftApi.middleware),
  });
};

describe('aircraftApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  // API Config
  describe('API Slice Configuration', () => {
    it('should have correct reducer path', () => {
      expect(aircraftApi.reducerPath).toBe('aircraftApi');
    });

    it('should have correct base query configuration', () => {
      expect(aircraftApi.endpoints).toBeDefined();
      expect(Object.keys(aircraftApi.endpoints)).toHaveLength(11);
    });

    it('should export all expected hooks', () => {
      expect(aircraftApi.useGetAircraftBankPercentageQuery).toBeDefined();
      expect(aircraftApi.useGetAircraftBySerialQuery).toBeDefined();
      expect(aircraftApi.useGetAircraftByUicQuery).toBeDefined();
      expect(aircraftApi.useGetAircraftCompanyQuery).toBeDefined();
      expect(aircraftApi.useGetAircraftDsrQuery).toBeDefined();
      expect(aircraftApi.useGetAircraftPhaseFlowByUicQuery).toBeDefined();
      expect(aircraftApi.useGetAircraftPhaseFlowModelsQuery).toBeDefined();
      expect(aircraftApi.useGetAircraftPhaseFlowSubordinatesQuery).toBeDefined();
      expect(aircraftApi.useGetAircraftEquipmentDetailsQuery).toBeDefined();
      expect(aircraftApi.useEditAircraftEquipmentDetailsMutation).toBeDefined();
      expect(aircraftApi.useGetAircraftModificationKitsQuery).toBeDefined();
    });

    it('should properly integrate with Redux store', () => {
      const state = store.getState();
      expect(state).toHaveProperty(aircraftApi.reducerPath);
    });
  });

  describe('useGetAircraftByUicQuery', () => {
    const queryParam = 'TEST_UIC';
    const expected = [mockAircraftDto].map(mapToIAircraft);

    it('should successfully fetch aircraft by UIC', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => aircraftApi.useGetAircraftByUicQuery(queryParam), {
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
      const queryParam = 'not-found';

      const { result } = renderHook(() => aircraftApi.useGetAircraftByUicQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('should track loading state correctly', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => aircraftApi.useGetAircraftByUicQuery(queryParam), {
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

  describe('useGetAircraftBySerialQuery', () => {
    const queryParam = '12345';
    const expected = mapToIAircraft(mockAircraftDto);

    it('should successfully fetch aircraft by serial', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => aircraftApi.useGetAircraftBySerialQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expected);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle serial not found error', async () => {
      const wrapper = createWrapper(store);
      const queryParam = 'not-found';

      const { result } = renderHook(() => aircraftApi.useGetAircraftBySerialQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useGetAircraftPhaseFlowByUicQuery', () => {
    const queryParam = 'TEST_UIC';
    const expected = [mockAircraftPhaseFlowDto].map(mapToIAircraftPhaseFlow);

    it('should successfully fetch aircraft phase flow by UIC', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => aircraftApi.useGetAircraftPhaseFlowByUicQuery(queryParam), {
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
      const queryParam = 'not-found';

      const { result } = renderHook(() => aircraftApi.useGetAircraftPhaseFlowByUicQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useGetAircraftPhaseFlowSubordinatesQuery', () => {
    const queryParam = 'TEST_UIC';
    const expected = [mockAircraftPhaseFlowSubordinatesDto].map(mapToAircraftPhaseFlowSubordinates);

    it('should successfully fetch aircraft phase flow subordinates', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => aircraftApi.useGetAircraftPhaseFlowSubordinatesQuery(queryParam), {
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
      const queryParam = 'not-found';

      const { result } = renderHook(() => aircraftApi.useGetAircraftPhaseFlowSubordinatesQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useGetAircraftPhaseFlowModelsQuery', () => {
    const queryParam = 'TEST_UIC';
    const expected = [mockAircraftPhaseFlowModelsDto]
      .filter((item) => item.aircraft.length > 0)
      .map(mapToAircraftPhaseFlowModels);

    it('should successfully fetch aircraft phase flow models', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => aircraftApi.useGetAircraftPhaseFlowModelsQuery(queryParam), {
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
      const queryParam = 'not-found';

      const { result } = renderHook(() => aircraftApi.useGetAircraftPhaseFlowModelsQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useGetAircraftBankPercentageQuery', () => {
    const queryParam = 'TEST_UIC';
    const expected = [mockAircraftBankPercentageDto].map(mapToIAircraftBankPercentage);

    it('should successfully fetch aircraft bank percentage', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => aircraftApi.useGetAircraftBankPercentageQuery(queryParam), {
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
      const queryParam = 'not-found';

      const { result } = renderHook(() => aircraftApi.useGetAircraftBankPercentageQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useGetAircraftCompanyQuery', () => {
    const queryParam = 'TEST_UIC';
    const expected = [mockAircraftCompanyDto].map(mapToIAircraftCompany);

    it('should successfully fetch aircraft companies', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => aircraftApi.useGetAircraftCompanyQuery(queryParam), {
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
      const queryParam = 'not-found';

      const { result } = renderHook(() => aircraftApi.useGetAircraftCompanyQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useGetAircraftDsrQuery', () => {
    const queryParam = { uic: 'TEST_UIC', serials: ['12345'] };
    const expected = {
      aircraft: mockAircraftDsrDto.aircraft.map((dto) => ({
        dateDown: dto.date_down.toISOString(),
        hoursToPhase: dto.hours_to_phase,
        inPhase: dto.in_phase,
        lastUpdateTime: dto.last_update_time.toISOString(),
        phaseStartDate: dto.phase_start_date.toISOString(),
        remarks: dto.remarks,
        serial: dto.serial,
        totalAirframeHours: dto.total_airframe_hours,
      })),
      inspection: mockAircraftDsrDto.inspection.map(mapToIAircraftInspection),
    };

    it('should successfully fetch aircraft DSR', async () => {
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => aircraftApi.useGetAircraftDsrQuery(queryParam), {
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
      const queryParam = { uic: 'not-found', serials: ['12345'] };

      const { result } = renderHook(() => aircraftApi.useGetAircraftDsrQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('Should successfully fetch aircraftEquipmentDetails', async () => {
      const wrapper = createWrapper(store);
      const { result } = renderHook(() => aircraftApi.useGetAircraftEquipmentDetailsQuery({ uic: 'TEST_UIC' }), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.error).toBeUndefined();
    });

    it('Should successfully edit aircraftEquipmentDetails', async () => {
      const wrapper = createWrapper(store);
      const { result } = renderHook(() => aircraftApi.useEditAircraftEquipmentDetailsMutation(), {
        wrapper,
      });

      // Mock payload to send in the PATCH request
      const payload: IAircraftEditInDto[] = [
        {
          serial: 'string',
          rtl: 'string',
          status: 'string',
          date_down: null,
          ecd: null,
          total_airframe_hours: 100,
          flight_hours: 10,
          location_id: 1,
          remarks: 'string',
          field_sync_status: { rtl: true, statue: true },
          mods: [
            {
              id: 0,
              mod_type: 'string',
              value: 'string',
            },
          ],
        },
      ];

      // Trigger the mutation
      const [editAircraftEquipmentDetails] = result.current;
      const response = await editAircraftEquipmentDetails(payload);

      const expected: IAircraftEditOut = {
        detail: 'test',
        editedAircraft: ['1', '2'],
        notEditedAircraft: [],
      };

      // Assert the response data
      expect(response.data).toEqual(expected);

      // Assert no error occurred
      expect(response.error).toBeUndefined();
    });

    it('fetch useGetAircraftModificationKitsQuery', async () => {
      const wrapper = createWrapper(store);
      const { result } = renderHook(() => aircraftApi.useGetAircraftModificationKitsQuery({ serial: 'test serial' }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.error).toBeUndefined();
    });
  });

  // ERROR HANDLING
  describe('Error Handling', () => {
    it('should handle server errors for getAircraftByUic', async () => {
      const wrapper = createWrapper(store);
      const queryParam = 'server-error';

      const { result } = renderHook(() => aircraftApi.useGetAircraftByUicQuery(queryParam), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });

    it('should handle server errors for getAircraftBySerial', async () => {
      const wrapper = createWrapper(store);
      const queryParam = 'server-error';

      const { result } = renderHook(() => aircraftApi.useGetAircraftBySerialQuery(queryParam), {
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
    it('should cache results correctly for getAircraftByUic', async () => {
      const wrapper = createWrapper(store);
      const queryParam = 'TEST_UIC';

      const { result } = renderHook(() => aircraftApi.useGetAircraftByUicQuery(queryParam), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const { result: result2 } = renderHook(() => aircraftApi.useGetAircraftByUicQuery(queryParam), {
        wrapper,
      });

      expect(result2.current.data).toEqual([mockAircraftDto].map(mapToIAircraft));
      expect(result2.current.isLoading).toBe(false);
    });

    it('should handle different query parameters separately', async () => {
      const wrapper = createWrapper(store);

      const queryParam1 = 'TEST_UIC';
      const queryParam2 = 'DIFFERENT_UIC';

      const { result: result1 } = renderHook(() => aircraftApi.useGetAircraftByUicQuery(queryParam1), {
        wrapper,
      });

      const { result: result2 } = renderHook(() => aircraftApi.useGetAircraftByUicQuery(queryParam2), {
        wrapper,
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
        expect(result2.current.isSuccess).toBe(true);
      });

      expect(result1.current.data).toEqual([mockAircraftDto].map(mapToIAircraft));
      expect(result2.current.data).toEqual([mockAircraftDto].map(mapToIAircraft));
    });
  });
});
