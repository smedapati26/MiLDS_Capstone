import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { GRIFFIN_USER_BASE_URL } from '@store/griffin_api/base_urls';
import {
  IAppUser,
  IAppUserDto,
  ICreateAppUserOut,
  mapToIAppUser,
  mapToIUpdatedAppUserDto,
} from '@store/griffin_api/users/models/IAppUser';

// API Slice
export const griffinUsersApi = createApi({
  reducerPath: 'griffinUsersApi',
  baseQuery: authFetchBaseQuery({ baseUrl: GRIFFIN_USER_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    createUser: builder.mutation<IAppUser, ICreateAppUserOut>({
      query: (body) => {
        return {
          url: '',
          method: 'POST',
          body,
        };
      },
      transformResponse: (response: IAppUserDto) => mapToIAppUser(response),
    }),
    getUser: builder.query<IAppUser, { userId: string }>({
      query: ({ userId }) => ({
        url: `/${userId}`,
        method: 'GET',
      }),
      transformResponse: (response: IAppUserDto) => mapToIAppUser(response),
    }),
    updateUser: builder.mutation<IAppUser, IAppUser>({
      query: (user) => {
        return {
          url: `/${user.userId}`,
          method: 'PUT',
          body: mapToIUpdatedAppUserDto(user),
        };
      },
      transformResponse: (response: IAppUserDto) => mapToIAppUser(response),
    }),
    getUserElevatedRoles: builder.query<{ admin: string[]; write: string[] }, string>({
      query: (userId) => ({
        url: `/elevated_roles/${userId}`,
        method: 'GET',
      }),
    }),
  }),
});

// Hooks
export const { useCreateUserMutation, useGetUserQuery, useUpdateUserMutation, useGetUserElevatedRolesQuery } =
  griffinUsersApi;
