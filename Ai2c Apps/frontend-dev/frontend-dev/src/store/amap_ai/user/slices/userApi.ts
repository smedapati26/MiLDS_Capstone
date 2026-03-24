import { createApi } from '@reduxjs/toolkit/query/react';

import { ISoldierDTO } from '@store/amap_ai/soldier/models';
import { IAppUser, ICreateAppUserOut } from '@store/amap_ai/user/models';
import { mapResponseData } from '@utils/helpers/dataTransformer';

import { authFetchBaseQuery } from '../../../authFetchBaseQuery';

export const usersBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/users`;

export const userApiSlice = createApi({
  reducerPath: 'usersApi',
  baseQuery: authFetchBaseQuery({ baseUrl: usersBaseUrl }),
  endpoints: (builder) => ({
    createUser: builder.mutation<IAppUser, ICreateAppUserOut>({
      query: (body) => {
        return {
          url: '',
          method: 'POST',
          body,
        };
      },
    }),
    getUser: builder.query<IAppUser, { userId: string }>({
      query: ({ userId }) => ({
        url: `/${userId}`,
        method: 'GET',
      }),
      transformResponse: (response: ISoldierDTO) => mapResponseData(response),
    }),
    updateUser: builder.mutation<IAppUser, Partial<ICreateAppUserOut> & Pick<IAppUser, 'userId'>>({
      query: ({ userId, ...body }) => {
        return {
          url: `/${userId}`,
          method: 'PUT',
          body,
        };
      },
    }),
  }),
});

export const { useCreateUserMutation, useGetUserQuery, useLazyGetUserQuery, useUpdateUserMutation } = userApiSlice;
