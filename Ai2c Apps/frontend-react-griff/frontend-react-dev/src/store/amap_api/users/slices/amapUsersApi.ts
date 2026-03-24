import { createApi } from '@reduxjs/toolkit/query/react';

import { AMAP_USERS_BASE_URL } from '@store/amap_api/base_urls';
import { authFetchBaseQuery } from '@store/authFetchBaseQuery';

import { AmapUserTagEnum } from '../cacheTags';
import { IElevateRoles } from '../models';

// API Slice
export const amapUsersApi = createApi({
  reducerPath: 'amapUsersApi',
  baseQuery: authFetchBaseQuery({ baseUrl: AMAP_USERS_BASE_URL }),
  keepUnusedDataFor: 300,
  tagTypes: [AmapUserTagEnum.ELEVATED_ROLES],
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getAmapUserElevatedRoles: builder.query<IElevateRoles, string>({
      query: (userId) => ({
        url: `/elevated_roles/${userId}`,
        method: 'GET',
      }),
      providesTags: [AmapUserTagEnum.ELEVATED_ROLES],
    }),
  }),
});

// Hooks
export const { useGetAmapUserElevatedRolesQuery } = amapUsersApi;
