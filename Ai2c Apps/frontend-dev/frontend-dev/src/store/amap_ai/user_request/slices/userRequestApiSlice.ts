import { createApi } from '@reduxjs/toolkit/query/react';

import { ISoldierUnits } from '@store/amap_ai/transfer_request';
import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { createQueryString } from '@utils/helpers';
import { mapResponseData } from '@utils/helpers/dataTransformer';

import {
  IUnitPermissionRequest,
  IUnitPermissionRequestDTO,
  IUserPermission,
  IUserRequestedPermissions,
  mapToIUnitPermissionRequest,
} from '../models';

export const userRequestsBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/user_requests`;

export const userRequestApiSlice = createApi({
  reducerPath: 'userRequestsApi',
  baseQuery: authFetchBaseQuery({
    baseUrl: userRequestsBaseUrl,
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
    createPermissionRequest: builder.mutation<
      { message: string; success: boolean },
      { user_id: string; unit_id: string; role: string }
    >({
      query: (data) => ({
        url: `/permission-requests`,
        method: 'POST',
        body: data,
      }),
    }),
    adjudicatePermissionRequests: builder.mutation<
      { message: string; success: boolean },
      { request_ids: number[]; approved: boolean; adjudicator_dod_id: string }
    >({
      query: (data) => ({
        url: `/adjudicate-permission-requests`,
        method: 'POST',
        body: data,
      }),
    }),
    getUnits: builder.query<ISoldierUnits[], { uics: string[] }>({
      query: ({ uics }) => {
        const queryParams = createQueryString({ uics });
        return queryParams ? `/units/soldiers?${queryParams}` : '/units/soldiers?uics=';
      },
      transformResponse: (response: ISoldierUnits[]) => mapResponseData(response),
    }),
    getMyPermissions: builder.query<IUserPermission[], void>({
      query: () => ({
        url: `/user-permissions`,
        method: 'GET',
      }),
      transformResponse: (response: IUserPermission[]) => mapResponseData(response),
    }),
    getMyRequestedPermissions: builder.query<IUserRequestedPermissions[], void>({
      query: () => ({
        url: `/user-requested-permissions`,
        method: 'GET',
      }),
      transformResponse: (response: IUserRequestedPermissions[]) => mapResponseData(response),
    }),
    deletePermissionRequest: builder.mutation<{ success: boolean; message: string }, { request_id: number }>({
      query: (data) => ({
        url: `/permission-requests`,
        method: 'DELETE',
        body: data,
      }),
    }),
  }),
});

// Reducer
export const userRequestsApiReducer = userRequestApiSlice.reducer;

// Hooks
export const {
  useLazyGetUnitsQuery,
  useLazyGetMyPermissionsQuery,
  useLazyGetMyRequestedPermissionsQuery,
  useAdjudicatePermissionRequestsMutation,
  useGetPermissionRequestsQuery,
  useLazyGetPermissionRequestsQuery,
  useLazyRequestsCountQuery,
  useRequestsCountQuery,
  useCreatePermissionRequestMutation,
  useDeletePermissionRequestMutation,
} = userRequestApiSlice;
