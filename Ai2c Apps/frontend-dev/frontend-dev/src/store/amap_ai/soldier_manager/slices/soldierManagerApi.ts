import { createApi } from '@reduxjs/toolkit/query/react';

import {
  ICreateSoldierDTO,
  ISoldierActiveFlag,
  ISoldierActiveFlagDTO,
  ISoldierInfo,
  ISoldierInfoDTO,
  IUnitActiveFlag,
  IUnitActiveFlagDTO,
  IUnitSoldierFlag,
  IUnitSoldierFlagDTO,
  mapToISoldierActiveFlag,
  mapToISoldierInfo,
  mapToIUnitActiveFlag,
  mapToIUnitSoldierFlag,
} from '@store/amap_ai/soldier_manager/models';
import { TransferRequest, TransferRequestDto } from '@store/amap_ai/transfer_request';
import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { mapResponseData } from '@utils/helpers/dataTransformer';

export const soldierManagerBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/soldier_manager`;

type TransferTypes = 'pending_user_adjudication' | 'users_pending_requests';

export const soldierManagerApiSlice = createApi({
  reducerPath: 'soldierManagerApi',
  baseQuery: authFetchBaseQuery({
    baseUrl: soldierManagerBaseUrl,
  }),
  endpoints: (builder) => ({
    soldierExists: builder.query<boolean, { soldierId: string }>({
      query: ({ soldierId }) => ({
        url: `/soldier_exists/${soldierId}`,
        method: 'GET',
      }),
    }),
    createSoldier: builder.mutation<{ message: string; success: boolean }, ICreateSoldierDTO>({
      query: (data) => {
        return {
          url: `/soldiers`,
          method: 'POST',
          body: data,
        };
      },
    }),
    getSoldierFlags: builder.query<ISoldierActiveFlag[], string>({
      query: (soldierId) => ({
        url: `/soldiers/${soldierId}/flags`,
        method: 'GET',
      }),
      transformResponse: (response: ISoldierActiveFlagDTO[]) => response.map(mapToISoldierActiveFlag),
    }),
    getUnitFlags: builder.query<IUnitActiveFlag[], string>({
      query: (unitUic) => ({
        url: `/unit/${unitUic}/flags`,
        method: 'GET',
      }),
      transformResponse: (response: IUnitActiveFlagDTO[]) => response.map(mapToIUnitActiveFlag),
    }),
    getUnitSoldierFlags: builder.query<{ mxAvailability: string; soldierFlags: IUnitSoldierFlag[] }, string>({
      query: (unitUic) => ({
        url: `/unit/${unitUic}/soldier_flags`,
        method: 'GET',
      }),
      transformResponse: (response: { unit_mx_availability: string; soldier_flags: IUnitSoldierFlagDTO[] }) => ({
        mxAvailability: response.unit_mx_availability,
        soldierFlags: response.soldier_flags.map(mapToIUnitSoldierFlag),
      }),
    }),
    getSoldierInfo: builder.query<ISoldierInfo, string>({
      query: (soldierId) => ({
        url: `/soldiers/${soldierId}/info`,
        method: 'GET',
      }),
      transformResponse: (response: ISoldierInfoDTO) => mapToISoldierInfo(response),
    }),
    getTransferRequests: builder.query<{ transferRequests: TransferRequest[] }, { get_type: TransferTypes }>({
      query: ({ get_type }) => ({
        url: `/transfer_requests/${get_type}`,
        method: 'GET',
      }),
      transformResponse: (response: { transfer_requests: TransferRequestDto[] }) => mapResponseData(response),
    }),
    adjudicateSoldier: builder.mutation<
      { message: string; success: boolean },
      { soldier_ids: string[]; gaining_uic: string; grant: boolean }
    >({
      query: (data) => {
        return {
          url: `/adjudicate`,
          method: 'POST',
          body: data,
        };
      },
    }),
  }),
});

// Reducer
export const soldierManagerApiReducer = soldierManagerApiSlice.reducer;

// Hooks
export const {
  useGetTransferRequestsQuery,
  useAdjudicateSoldierMutation,
  useLazySoldierExistsQuery,
  useCreateSoldierMutation,
  useLazyGetSoldierFlagsQuery,
  useLazyGetUnitFlagsQuery,
  useLazyGetSoldierInfoQuery,
  useLazyGetUnitSoldierFlagsQuery,
} = soldierManagerApiSlice;
