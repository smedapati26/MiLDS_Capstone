import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';

import { IUnitBrief, IUnitBriefDto, mapToIUnitBrief } from '../models/IUnitBrief';
export const favoriteUnitsBaseUrl = `${import.meta.env.VITE_GRIFFIN_API_URL}/units/favorites`;

export const favoriteUnitsApi = createApi({
  reducerPath: 'favoriteUnitsApi',
  baseQuery: authFetchBaseQuery({ baseUrl: favoriteUnitsBaseUrl }),
  keepUnusedDataFor: 300,
  tagTypes: ['FavoriteUnits'],
  endpoints: (builder) => ({
    getFavoriteUnits: builder.query<IUnitBrief[], { userId: string }>({
      query: ({ userId }) => ({
        url: `/${userId}`,
        method: 'GET',
      }),
      transformResponse: (response: Array<IUnitBriefDto>) => response.map(mapToIUnitBrief),
      providesTags: ['FavoriteUnits'],
    }),
    addFavoriteUnits: builder.mutation<IUnitBrief[], { userId: string; uics: string[] }>({
      query: ({ userId, uics }) => ({
        url: `/${userId}`,
        method: 'POST',
        body: { uics },
      }),
      transformResponse: (response: Array<IUnitBriefDto>) => response.map(mapToIUnitBrief),
      invalidatesTags: ['FavoriteUnits'],
    }),
    removeFavoriteUnits: builder.mutation<IUnitBrief[], { userId: string; uics: string[] }>({
      query: ({ userId, uics }) => ({
        url: `/${userId}`,
        method: 'DELETE',
        body: { uics },
      }),
      transformResponse: (response: Array<IUnitBriefDto>) => response.map(mapToIUnitBrief),
      invalidatesTags: ['FavoriteUnits'],
    }),
  }),
});

export const { useGetFavoriteUnitsQuery, useAddFavoriteUnitsMutation, useRemoveFavoriteUnitsMutation } =
  favoriteUnitsApi;
