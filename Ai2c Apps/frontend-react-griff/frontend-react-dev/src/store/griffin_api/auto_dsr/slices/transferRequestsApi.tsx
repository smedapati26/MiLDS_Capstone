import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { aircraftApi } from '@store/griffin_api/aircraft/slices';
import { AUTO_DSR_BASE_URL } from '@store/griffin_api/base_urls';

import {
  ITransferRequest,
  ITransferRequestDto,
  ITransferRequestInDto,
  ITransferRequestResponse,
  mapToITransferRequest,
} from '../models/ITransferRequest';
import {
  IAdjudicateTransferRequestPayload,
  IAdjudicateTransferRequestResponse,
} from '../models/ITransferRequestAdjudication';

/* Transfer Requests API Slice */
export const transferRequestsApi = createApi({
  reducerPath: 'transferRequestsApi',
  baseQuery: authFetchBaseQuery({ baseUrl: AUTO_DSR_BASE_URL }),
  keepUnusedDataFor: 300,
  tagTypes: ['TransferRequests'],
  endpoints: (build) => ({
    createTransferRequest: build.mutation<ITransferRequestResponse, ITransferRequestInDto>({
      query: (payload) => ({
        url: '/object-transfer-request',
        method: 'POST',
        body: payload,
      }),
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        if (arg) {
          await queryFulfilled;
          dispatch(aircraftApi.util.invalidateTags(['Aircraft']));
        }
      },
    }),
    getTransferRequests: build.query<ITransferRequest[], { uic?: string } | void>({
      query: (arg) => {
        const params: Record<string, string> = {};

        // Only add uic param if provided
        if (arg && 'uic' in arg && arg.uic) {
          params.uic = arg.uic;
        }

        return {
          url: '/object-transfer-request',
          method: 'GET',
          params,
        };
      },
      transformResponse: (response: ITransferRequestDto[]) => {
        return response.map(mapToITransferRequest);
      },
      providesTags: ['TransferRequests'],
    }),
    adjudicateTransferRequest: build.mutation<IAdjudicateTransferRequestResponse, IAdjudicateTransferRequestPayload>({
      query: (payload) => ({
        url: '/adjudicate-object-transfer-request',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['TransferRequests'],
    }),
  }),
});

// Hooks
export const { useCreateTransferRequestMutation, useGetTransferRequestsQuery, useAdjudicateTransferRequestMutation } =
  transferRequestsApi;
