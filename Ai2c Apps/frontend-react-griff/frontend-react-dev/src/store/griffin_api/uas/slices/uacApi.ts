import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { UAS_BASE_URL } from '@store/griffin_api/base_urls';
import { IUAS, IUasDto, IUASIn, IUasOut, mapIUasInToDto, mapToUas } from '@store/griffin_api/uas/models/IUAS';

// API Slice
export const uacApi = createApi({
  reducerPath: 'uacApi',
  baseQuery: authFetchBaseQuery({ baseUrl: UAS_BASE_URL }),
  keepUnusedDataFor: 300,
  tagTypes: ['UAC'],
  endpoints: (builder) => ({
    getUAC: builder.query<IUAS[], { uic: string; search?: string }>({
      query: ({ uic, search }) => {
        const params = new URLSearchParams();
        if (uic) params.append('uic', uic);
        if (search) params.append('search', search);
        return `uac?${params}`;
      },
      transformResponse: (response: IUasDto[]) => response.map(mapToUas),
      providesTags: ['UAC'],
    }),
    editUacEquipment: builder.mutation<IUasOut, { id: number; payload: IUASIn }>({
      query: (payload) => ({
        url: `/uac/${payload.id}`,
        method: 'PUT',
        body: mapIUasInToDto(payload.payload),
      }),
      invalidatesTags: ['UAC'],
    }),
  }),
});

// Hooks
export const { useGetUACQuery, useEditUacEquipmentMutation } = uacApi;
