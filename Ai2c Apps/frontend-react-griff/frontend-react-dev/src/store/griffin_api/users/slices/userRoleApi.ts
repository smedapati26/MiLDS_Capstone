import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { GRIFFIN_USER_BASE_URL } from '@store/griffin_api/base_urls';

import { IUserRole, IUserRoleIn, IUserRoleOut, mapToIUserRole, mapToIUserRoleOut } from '../models/IUserRole';

export const USER_ROLE_BASE_URL = `${GRIFFIN_USER_BASE_URL}/roles`;

export const userRoleApi = createApi({
  reducerPath: 'userRoleApi',
  baseQuery: authFetchBaseQuery({ baseUrl: USER_ROLE_BASE_URL }),
  tagTypes: ['UserRole'],
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getRoles: builder.query<IUserRole[], undefined>({
      query: () => ({
        url: '/all',
        method: 'GET',
      }),
      transformResponse: (response: Array<IUserRoleIn>) => response.map(mapToIUserRole),
      providesTags: ['UserRole'],
    }),
    getRolesByUserId: builder.query<IUserRole[], { userId: string }>({
      query: ({ userId }) => ({
        url: `/${userId}`,
        method: 'GET',
      }),
      transformResponse: (response: Array<IUserRoleIn>) => response.map(mapToIUserRole),
    }),
    createRole: builder.mutation<IUserRole, { newRole: IUserRoleOut }>({
      query: ({ newRole }) => ({
        url: `/${newRole.user_id}/${newRole.unit_uic}`,
        method: 'POST',
        body: newRole,
      }),
      transformResponse: (response: IUserRoleIn) => mapToIUserRole(response),
      invalidatesTags: ['UserRole'],
    }),
    updateRole: builder.mutation<IUserRole, { updatedRole: IUserRole }>({
      query: ({ updatedRole }) => ({
        url: `/${updatedRole.user.userId}/${updatedRole.unit.uic}`,
        method: 'PUT',
        body: mapToIUserRoleOut(updatedRole),
      }),
      transformResponse: (response: IUserRoleIn) => mapToIUserRole(response),
      invalidatesTags: ['UserRole'],
    }),
  }),
});

export const { useGetRolesQuery, useGetRolesByUserIdQuery, useCreateRoleMutation, useUpdateRoleMutation } = userRoleApi;
