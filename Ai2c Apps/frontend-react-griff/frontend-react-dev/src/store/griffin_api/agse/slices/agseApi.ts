import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import {
  IAggregateCondition,
  IAggregateConditionDto,
  IAGSEEditInDto,
  IAGSEEditOut,
  IAGSEEditOutDto,
  IAGSEOut,
  IAGSEOutDto,
  IAGSESubordinate,
  IAGSESubordinateDto,
  mapToAggregateCondition,
  mapToAGSEEditOut,
  mapToAGSEOut,
  mapToAGSESubordinate,
} from '@store/griffin_api/agse/models';
import { AGSE_BASE_URL } from '@store/griffin_api/base_urls';

// API Slice
export const agseApi = createApi({
  reducerPath: 'agseApi',
  baseQuery: authFetchBaseQuery({ baseUrl: AGSE_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getAGSE: builder.query<IAGSEOut, string | undefined>({
      query: (uic) => ({
        url: '/agse',
        params: {
          uic,
        },
      }),
      transformResponse: (response: IAGSEOutDto) => mapToAGSEOut(response),
    }),
    getAGSESubordinate: builder.query<IAGSESubordinate[], { uic: string; search?: string }>({
      query: ({ uic, search }) => {
        const params = new URLSearchParams();
        if (uic) params.append('uic', uic);
        if (search) params.append('search', search);

        return `agse-subordinate?${params.toString()}`;
      },
      transformResponse: (response: IAGSESubordinateDto[]) => response.map(mapToAGSESubordinate),
    }),
    getAggregateCondition: builder.query<IAggregateCondition[], string>({
      query: (uic) => `aggregate-condition?uic=${uic}`,
      transformResponse: (response: IAggregateConditionDto[]) => response.map(mapToAggregateCondition),
    }),
    editAGSE: builder.mutation<IAGSEEditOut, IAGSEEditInDto[]>({
      query: (payload) => ({
        url: 'edit',
        method: 'PATCH',
        body: payload,
      }),
      transformResponse: (response: IAGSEEditOutDto): IAGSEEditOut => mapToAGSEEditOut(response),
    }),
  }),
});

// Hooks
export const { useGetAGSEQuery, useGetAGSESubordinateQuery, useGetAggregateConditionQuery, useEditAGSEMutation } =
  agseApi;
