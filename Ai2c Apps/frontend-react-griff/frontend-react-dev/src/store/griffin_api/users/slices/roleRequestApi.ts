import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { GRIFFIN_USER_BASE_URL } from '@store/griffin_api/base_urls';

import { IRoleRequest, IRoleRequestIn, IRoleRequestOut, mapRoleRequest } from '../models/IRoleRequest';

export const ROLE_REQUEST_BASE_URL = `${GRIFFIN_USER_BASE_URL}/requests`;

export const roleRequestApi = createApi({
  reducerPath: 'roleRequestApi',
  baseQuery: authFetchBaseQuery({ baseUrl: ROLE_REQUEST_BASE_URL }),
  tagTypes: ['RoleRequest'],
  endpoints: (builder) => ({
    getRoleRequestsByUserId: builder.query<IRoleRequest[], { userId: string }>({
      providesTags: ['RoleRequest'],
      query: ({ userId }) => {
        return {
          url: '/',
          method: 'GET',
          params: { userId: userId },
        };
      },
      transformResponse: (response: IRoleRequestIn[]) => response.map(mapRoleRequest),
    }),
    createRoleRequest: builder.mutation<void, IRoleRequestOut>({
      query: (body) => {
        return {
          url: '/',
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['RoleRequest'],
    }),
    deleteRoleRequest: builder.mutation<void, { request: IRoleRequest }>({
      query: ({ request }) => {
        return {
          url: `/${request.id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['RoleRequest'],
    }),
  }),
});

export const { useGetRoleRequestsByUserIdQuery, useCreateRoleRequestMutation, useDeleteRoleRequestMutation } =
  roleRequestApi;
