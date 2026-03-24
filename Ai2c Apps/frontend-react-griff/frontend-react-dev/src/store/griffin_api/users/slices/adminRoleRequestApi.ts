import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { GRIFFIN_USER_BASE_URL } from '@store/griffin_api/base_urls';

import {
  IAdminRoleRequest,
  IAdminRoleRequestIn,
  mapToIAdminRoleRequest,
  RoleRequestStatus,
} from '../models/IAdminRoleRequest';

export const ROLE_REQUEST_ADMIN_BASE_URL = `${GRIFFIN_USER_BASE_URL}/requests/admin`;

export const adminRoleRequestApi = createApi({
  reducerPath: 'adminRoleRequestApi',
  baseQuery: authFetchBaseQuery({ baseUrl: ROLE_REQUEST_ADMIN_BASE_URL }),
  tagTypes: ['AdminRoleRequest'],
  endpoints: (builder) => ({
    getAllRoleRequestsForAdmin: builder.query<IAdminRoleRequest[], undefined>({
      providesTags: ['AdminRoleRequest'],
      query: () => {
        return {
          url: '/',
          method: 'GET',
        };
      },
      transformResponse: (response: IAdminRoleRequestIn[]) => response.map(mapToIAdminRoleRequest),
    }),
    adjudicateRoleRequestForAdmin: builder.mutation<
      IAdminRoleRequest,
      { updatedRequest: IAdminRoleRequest; status: RoleRequestStatus }
    >({
      query: ({ updatedRequest, status }) => {
        return {
          url: `/${status}/${updatedRequest.user.userId}/${updatedRequest.unit.uic}`,
          method: 'PUT',
        };
      },
      transformResponse: (response: IAdminRoleRequestIn) => mapToIAdminRoleRequest(response),
      invalidatesTags: ['AdminRoleRequest'],
    }),
  }),
});

export const { useAdjudicateRoleRequestForAdminMutation, useGetAllRoleRequestsForAdminQuery } = adminRoleRequestApi;
