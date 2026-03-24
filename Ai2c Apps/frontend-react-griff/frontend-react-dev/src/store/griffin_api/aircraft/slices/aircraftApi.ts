// Import the RTK Query methods from the React-specific entry point
import { createApi } from '@reduxjs/toolkit/query/react';

import { IPagedData } from '@models/IPagedData';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import {
  IAircraft,
  IAircraftBankPercentage,
  IAircraftBankPercentageDto,
  IAircraftCompany,
  IAircraftCompanyDto,
  IAircraftDsr,
  IAircraftDsrDto,
  IAircraftDto,
  IAircraftEditInDto,
  IAircraftEditOut,
  IAircraftEditOutDto,
  IAircraftEquipmentDetails,
  IAircraftEquipmentDetailsDto,
  IAircraftModification,
  IAircraftModificationDto,
  IAircraftPhaseFlow,
  IAircraftPhaseFlowDto,
  IAircraftPhaseFlowModels,
  IAircraftPhaseFlowModelsDto,
  IAircraftPhaseFlowSubordinates,
  IAircraftPhaseFlowSubordinatesDto,
  mapToAircraftEditOut,
  mapToAircraftEquipmentDetails,
  mapToAircraftModification,
  mapToAircraftPhaseFlowModels,
  mapToAircraftPhaseFlowSubordinates,
  mapToIAircraft,
  mapToIAircraftBankPercentage,
  mapToIAircraftCompany,
  mapToIAircraftDetail,
  mapToIAircraftInspection,
  mapToIAircraftPhaseFlow,
} from '@store/griffin_api/aircraft/models/IAircraft';
import { autoDsrApi } from '@store/griffin_api/auto_dsr/slices';
import { AIRCRAFT_BASE_URL } from '@store/griffin_api/base_urls';
export type ReturnByType = 'unit' | 'subordinates' | 'model';

// Api Slice
export const aircraftApi = createApi({
  reducerPath: 'aircraftApi',
  tagTypes: ['Aircraft'],
  baseQuery: authFetchBaseQuery({ baseUrl: AIRCRAFT_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getAircraftByUic: builder.query<IAircraft[], string | [string, string?]>({
      query: (arg) => {
        const [uic, partNumber] = Array.isArray(arg) ? arg : [arg];
        return {
          url: '?uic=' + uic + (partNumber ? '&part_number=' + partNumber : ''),
        };
      },
      transformResponse: (response: IPagedData<IAircraftDto>) => response.items.map(mapToIAircraft),
    }),
    getAircraftBySerial: builder.query<IAircraft, string>({
      query: (serial) => `?serial=${serial}`,
      transformResponse: (response: IPagedData<IAircraftDto>) => mapToIAircraft(response.items[0]),
    }),
    getAircraftPhaseFlowByUic: builder.query<IAircraftPhaseFlow[], string | [string, string[]?]>({
      query: (arg) => {
        const params = new URLSearchParams();
        const [uic, models] = Array.isArray(arg) ? arg : [arg];
        if (uic) params.append('uic', uic);
        if (models && models.length > 0) models.forEach((model: string) => params.append('models', model));

        return `/phase-flow?${params}`;
      },
      transformResponse: (response: IAircraftPhaseFlowDto[]) => response.map(mapToIAircraftPhaseFlow),
    }),
    getAircraftPhaseFlowSubordinates: builder.query<IAircraftPhaseFlowSubordinates[], string | [string, string[]?]>({
      query: (arg) => {
        const params = new URLSearchParams();
        const [uic, models] = Array.isArray(arg) ? arg : [arg];
        if (uic) params.append('uic', uic);
        if (models && models.length > 0) models.forEach((model: string) => params.append('models', model));

        return `/phase-flow-subordinates?${params}`;
      },
      transformResponse: (response: IAircraftPhaseFlowSubordinatesDto[]) =>
        response.map(mapToAircraftPhaseFlowSubordinates),
    }),
    getAircraftPhaseFlowModels: builder.query<IAircraftPhaseFlowModels[], string | [string, string[]?]>({
      query: (arg) => {
        const params = new URLSearchParams();
        const [uic, models] = Array.isArray(arg) ? arg : [arg];
        if (uic) params.append('uic', uic);
        if (models && models.length > 0) models.forEach((model: string) => params.append('models', model));

        return `/phase-flow-models?${params}`;
      },
      transformResponse: (response: IAircraftPhaseFlowModelsDto[]) =>
        response.filter((item) => item.aircraft.length > 0).map(mapToAircraftPhaseFlowModels),
    }),
    getAircraftBankPercentage: builder.query<IAircraftBankPercentage[], string | [string, ReturnByType?]>({
      query: (arg) => {
        const params = new URLSearchParams();
        const [uic, returnBy] = Array.isArray(arg) ? arg : [arg];

        if (uic) params.append('uic', uic);
        if (returnBy) params.append('return_by', returnBy);

        return `/bank-hour-percentage?${params}`;
      },
      transformResponse: (response: IAircraftBankPercentageDto[]) => response.map(mapToIAircraftBankPercentage),
    }),
    getAircraftCompany: builder.query<IAircraftCompany[], string | [string, string[]?, string[]?]>({
      query: (arg) => {
        const params = new URLSearchParams();
        const [uic, aircraftFamily, models] = Array.isArray(arg) ? arg : [arg];

        if (uic) params.append('uic', uic);
        if (aircraftFamily && aircraftFamily.length > 0)
          aircraftFamily.forEach((aircraft: string) => params.append('aircraft', aircraft));
        if (models && models.length > 0) models.forEach((model: string) => params.append('models', model));

        return `/companies?${params}`;
      },
      transformResponse: (response: IAircraftCompanyDto[]) => response.map(mapToIAircraftCompany),
    }),
    getAircraftDsr: builder.query({
      query: ({ uic, serials }) => {
        const params = new URLSearchParams();
        if (uic) {
          params.append('uic', uic);
        }
        if (serials && serials.length > 0) {
          serials.forEach((serial: string) => params.append('serials', serial));
        }

        return `/dsr?${params.toString()}`;
      },
      transformResponse: (response: IAircraftDsrDto): IAircraftDsr => ({
        aircraft: response.aircraft.map(mapToIAircraftDetail),
        inspection: response.inspection.map(mapToIAircraftInspection),
      }),
    }),
    getAircraftEquipmentDetails: builder.query<
      IAircraftEquipmentDetails[],
      { uic: string; serials?: string[]; search?: string }
    >({
      query: ({ uic, serials, search }) => {
        const params = new URLSearchParams();

        if (uic) {
          params.append('uic', uic);
        }
        if (serials && serials.length > 0) {
          serials.forEach((serial: string) => params.append('serials', serial));
        }
        if (search) params.append('search', search);

        return `details?${params.toString()}`;
      },
      transformResponse: (response: IAircraftEquipmentDetailsDto[]): IAircraftEquipmentDetails[] =>
        response.map(mapToAircraftEquipmentDetails),
      providesTags: ['Aircraft'],
    }),
    editAircraftEquipmentDetails: builder.mutation<IAircraftEditOut, IAircraftEditInDto[]>({
      query: (payload) => ({
        url: 'edit',
        method: 'PATCH',
        body: payload,
      }),
      transformResponse: (response: IAircraftEditOutDto): IAircraftEditOut => mapToAircraftEditOut(response),
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        if (arg) {
          await queryFulfilled;
          dispatch(autoDsrApi.util.invalidateTags(['Aircraft']));
        }
      },
    }),
    getAircraftModificationKits: builder.query<
      IPagedData<IAircraftModification>,
      { serial: string; limit?: number; offset?: number }
    >({
      query: ({ serial, limit = 10, offset = 0 }) => ({
        url: '/mods_kits',
        params: { serial, limit, offset },
      }),
      transformResponse: (response: IPagedData<IAircraftModificationDto>): IPagedData<IAircraftModification> => {
        return {
          ...response,
          items: response.items.map(mapToAircraftModification),
        };
      },
    }),
  }),
});

// Hooks
export const {
  useGetAircraftBankPercentageQuery,
  useGetAircraftBySerialQuery,
  useGetAircraftByUicQuery,
  useGetAircraftDsrQuery,
  useGetAircraftCompanyQuery,
  useGetAircraftPhaseFlowByUicQuery,
  useGetAircraftPhaseFlowSubordinatesQuery,
  useGetAircraftPhaseFlowModelsQuery,
  useGetAircraftEquipmentDetailsQuery,
  useEditAircraftEquipmentDetailsMutation,
  useGetAircraftModificationKitsQuery,
} = aircraftApi;
