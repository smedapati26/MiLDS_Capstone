import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { MODS_BASE_URL } from '@store/griffin_api/base_urls';

import {
  IModification,
  IModificationDto,
  IModificationEditInDto,
  IModificationEditOut,
  IModificationEditOutDto,
  IMods,
  IModsDto,
  INewModificationDto,
  mapToIModification,
  mapToIModificationEditOut,
  mapToMods,
} from '../models';

// Api Slice
export const modsApi = createApi({
  reducerPath: 'modsApi',
  baseQuery: authFetchBaseQuery({ baseUrl: MODS_BASE_URL }),
  keepUnusedDataFor: 300,
  tagTypes: ['Modifications'],
  endpoints: (builder) => ({
    addNewModification: builder.mutation<void, INewModificationDto>({
      query: (body) => {
        return {
          url: '',
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['Modifications'],
    }),
    deleteModification: builder.mutation<void, { modId: string }>({
      query: ({ modId }) => {
        const params = new URLSearchParams();
        params.append('mod_id', modId);
        return {
          url: '',
          method: 'DELETE',
          params,
        };
      },
      invalidatesTags: ['Modifications'],
    }),
    editModifications: builder.mutation<IModificationEditOut, IModificationEditInDto[]>({
      query: (payload) => ({
        url: '',
        method: 'PATCH',
        body: payload,
      }),
      transformResponse: (response: IModificationEditOutDto): IModificationEditOut =>
        mapToIModificationEditOut(response),
      invalidatesTags: ['Modifications'],
    }),
    getModificationsByUic: builder.query<IModification[], string>({
      query: (uic) => ({
        url: `/${uic}`,
        method: 'GET',
      }),
      transformResponse: (response: IModificationDto[]): IModification[] => response.map(mapToIModification),
      providesTags: ['Modifications'],
    }),
    getModificationTypes: builder.query<string[], void>({
      query: () => ({
        url: '/types',
        method: 'GET',
      }),
    }),
    getSelectedModsByUic: builder.query<IMods[], string>({
      query: (uic) => ({
        url: `/selected/${uic}`,
        method: 'GET',
      }),
      transformResponse: (response: IModsDto[]): IMods[] => response.map(mapToMods),
      providesTags: ['Modifications'],
    }),
  }),
});

// Hooks
export const {
  useAddNewModificationMutation,
  useDeleteModificationMutation,
  useEditModificationsMutation,
  useGetModificationsByUicQuery,
  useGetModificationTypesQuery,
  useGetSelectedModsByUicQuery,
} = modsApi;
