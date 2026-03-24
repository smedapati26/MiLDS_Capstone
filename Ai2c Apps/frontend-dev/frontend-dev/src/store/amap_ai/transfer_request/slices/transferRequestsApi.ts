import { createApi } from '@reduxjs/toolkit/query/react';

import {
  IUnitReceivedTransferRequest,
  IUnitReceivedTransferRequestDTO,
  IUnitSentTransferRequest,
  IUnitSentTransferRequestDTO,
  mapToIUnitReceivedTransferRequest,
  mapToIUnitSentTransferRequest,
} from '@store/amap_ai/soldier_manager';
import {
  IUnitPermissionRequest,
  IUnitPermissionRequestDTO,
  mapToIUnitPermissionRequest,
} from '@store/amap_ai/user_request';
import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { createQueryString } from '@utils/helpers';
import { mapResponseData } from '@utils/helpers/dataTransformer';

import { ISoldierUnits } from '../models';

export const transferRequestsBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/transfer_requests`;

export const transferRequestsApiSlice = createApi({
  reducerPath: 'transferRequestsApi',
  baseQuery: authFetchBaseQuery({
    baseUrl: transferRequestsBaseUrl,
  }),
  endpoints: (builder) => ({
    requestsCount: builder.query<{ permissionRequestCount: number; transferRequestCount: number }, void>({
      query: () => ({
        url: `/request-counts`,
        method: 'GET',
      }),
      transformResponse: (response: { permission_request_count: number; transfer_request_count: number }) => ({
        permissionRequestCount: response.permission_request_count,
        transferRequestCount: response.transfer_request_count,
      }),
    }),
    getPermissionRequests: builder.query<IUnitPermissionRequest[], void>({
      query: () => ({
        url: `/permission-requests`,
        method: 'GET',
      }),
      transformResponse: (response: IUnitPermissionRequestDTO[]) => response.map(mapToIUnitPermissionRequest),
    }),
    getTransferRequests: builder.query<
      { receivedRequests: IUnitReceivedTransferRequest[]; sentRequests: IUnitSentTransferRequest[] },
      void
    >({
      query: () => ({
        url: `/transfer-requests`,
        method: 'GET',
      }),
      transformResponse: (response: {
        received_requests: IUnitReceivedTransferRequestDTO[];
        sent_requests: IUnitSentTransferRequestDTO[];
      }) => ({
        receivedRequests: response.received_requests.map(mapToIUnitReceivedTransferRequest),
        sentRequests: response.sent_requests.map(mapToIUnitSentTransferRequest),
      }),
    }),
    adjudicateTransferRequests: builder.mutation<
      { message: string; success: boolean },
      { request_ids: number[]; approved: boolean; adjudicator_dod_id: string }
    >({
      query: (data) => {
        return {
          url: `/adjudicate-transfer-requests`,
          method: 'POST',
          body: data,
        };
      },
    }),
    adjudicatePermissionRequests: builder.mutation<
      { message: string; success: boolean },
      { request_ids: number[]; approved: boolean; adjudicator_dod_id: string }
    >({
      query: (data) => {
        return {
          url: `/adjudicate-permission-requests`,
          method: 'POST',
          body: data,
        };
      },
    }),
    getUnits: builder.query<ISoldierUnits[], { uics: string[] }>({
      query: ({ uics }) => {
        const queryParams = createQueryString({
          uics,
        });
        return queryParams ? `/units/soldiers?${queryParams}` : '/units/soldiers?uics=';
      },
      transformResponse: (response: ISoldierUnits[]) => mapResponseData(response),
    }),
    submitTransfer: builder.mutation<{ message: string }, { soldier_ids: string[]; gaining_uic: string }>({
      query: (data) => {
        return {
          url: `/transfer-requests`,
          method: 'POST',
          body: data,
        };
      },
    }),
  }),
});

// Reducer
export const transferRequestsApiReducer = transferRequestsApiSlice.reducer;

// Hooks
export const {
  useSubmitTransferMutation,
  useLazyGetUnitsQuery,
  useAdjudicatePermissionRequestsMutation,
  useAdjudicateTransferRequestsMutation,
  useGetPermissionRequestsQuery,
  useGetTransferRequestsQuery,
  useLazyGetPermissionRequestsQuery,
  useLazyGetTransferRequestsQuery,
  useLazyRequestsCountQuery,
  useRequestsCountQuery,
} = transferRequestsApiSlice;
