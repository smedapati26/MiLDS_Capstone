import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { mapResponseData } from '@utils/helpers/dataTransformer';

import { FaultAction, FaultDetails, IFaultActionDto, IFaultDetailsDto } from '../models';

export const faultRecordsBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/faults`;

export const faultsApiSlice = createApi({
  reducerPath: 'faultRecordsApi',
  baseQuery: authFetchBaseQuery({ baseUrl: faultRecordsBaseUrl }),
  endpoints: (builder) => ({
    getSoldierFaultsHistory: builder.query<FaultAction[], { soldier_id: string }>({
      query: ({ soldier_id }) => ({
        url: `/soldier/${soldier_id}/fault_history`,
        method: 'GET',
      }),
      transformResponse: (response: { fault_actions: IFaultActionDto[] }) => mapResponseData(response.fault_actions),
    }),
    getSoldierFaultIds: builder.query<string[], { soldier_id: string }>({
      query: ({ soldier_id }) => ({
        url: `/soldier/${soldier_id}/fault_ids`,
        method: 'GET',
      }),
      transformResponse: (response: { fault_ids: string[] }) => response.fault_ids,
    }),
    getSoldierWUCs: builder.query<string[], { soldier_id: string }>({
      query: ({ soldier_id }) => ({
        url: `/soldier/${soldier_id}/fault_wucs`,
        method: 'GET',
      }),
      transformResponse: (response: { wucs: string[] }) => response.wucs,
    }),
    getFaultStatusCodes: builder.query<{ value: string; label: string }[], void>({
      query: () => ({
        url: `/fault_status_codes`,
        method: 'GET',
      }),
      transformResponse: (response) => mapResponseData(response),
    }),
    getFaultById: builder.query<FaultDetails, { fault_id: string }>({
      query: ({ fault_id }) => ({
        url: `/fault/${fault_id}`,
        method: 'GET',
      }),
      transformResponse: (response: IFaultDetailsDto) => mapResponseData(response),
    }),
  }),
});

// Reducer
export const faultRecordsApiReducer = faultsApiSlice.reducer;

// Hooks
export const {
  useLazyGetSoldierFaultsHistoryQuery,
  useLazyGetSoldierFaultIdsQuery,
  useLazyGetSoldierWUCsQuery,
  useLazyGetFaultStatusCodesQuery,
  useLazyGetFaultByIdQuery,
} = faultsApiSlice;
