import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { mapResponseData } from '@utils/helpers/dataTransformer';

import { IUnitBrief, IUnitBriefDto, IUnitHierarchy, IUnitHierarchyDto, mapToIUnitBrief } from '../models';

export const unitsBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/units`;

export const unitsApiSlice = createApi({
  reducerPath: 'unitsApi',
  baseQuery: authFetchBaseQuery({ baseUrl: unitsBaseUrl }),
  endpoints: (builder) => ({
    getUnits: builder.query<IUnitBrief[], { topLevelUic?: string; role?: string; true_all?: boolean }>({
      query: ({ topLevelUic, role, true_all }) => ({
        url: '',
        method: 'GET',
        params: role
          ? {
              ...(topLevelUic ? { topLevelUic } : {}),
              ...(role ? { role } : {}),
              ...(true_all ? { true_all } : {}),
            }
          : undefined,
      }),
      transformResponse: (response: Array<IUnitBriefDto>) => response.map(mapToIUnitBrief),
    }),
    getUnitHierarchy: builder.query<IUnitHierarchy, { uic?: string }>({
      query: ({ uic }) => ({
        url: `/unit/${uic}/unit_hierarchy`,
      }),
      transformResponse: (response: Array<IUnitHierarchyDto>) => mapResponseData(response),
    }),
  }),
});

export const { useGetUnitsQuery, useLazyGetUnitsQuery, useLazyGetUnitHierarchyQuery } = unitsApiSlice;
