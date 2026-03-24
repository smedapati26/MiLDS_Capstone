import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { AUTO_DSR_BASE_URL } from '@store/griffin_api/base_urls';

import { IUnitBasic, IUnitBasicSUnits, IUnitBrief, IUnitBriefDto, mapToIUnitBrief } from '../models';

// Query Params
interface ISimilarUnitParameters extends Partial<IUnitBasic> {
  top_level_uic?: string;
  parent_unit?: string;
}
// Query Params
interface ISimilarUnitResponse extends Partial<IUnitBasicSUnits> {
  similar_units: string[];
}

// API slice
export const unitsApi = createApi({
  reducerPath: 'unitsApi',
  baseQuery: authFetchBaseQuery({ baseUrl: AUTO_DSR_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getUnits: builder.query<IUnitBrief[], { topLevelUic?: string }>({
      query: ({ topLevelUic }) => ({
        url: '/unit',
        params: topLevelUic ? { top_level_uic: topLevelUic } : undefined,
      }),
      transformResponse: (response: Array<IUnitBriefDto>) => response.map(mapToIUnitBrief),
    }),
    getSimilarUnits: builder.query({
      query: (params: ISimilarUnitParameters) => ({
        url: '/unit',
        params,
      }),
      transformResponse: (response: ISimilarUnitResponse[]) => response[0].similar_units,
    }),
  }),
});

// Hooks
export const { useGetUnitsQuery, useGetSimilarUnitsQuery } = unitsApi;
