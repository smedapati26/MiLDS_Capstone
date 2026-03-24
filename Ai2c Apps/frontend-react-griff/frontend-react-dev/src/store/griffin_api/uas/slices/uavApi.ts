import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { UAS_BASE_URL } from '@store/griffin_api/base_urls';
import { IUAS, IUasDto, IUASIn, IUasOut, mapIUasInToDto, mapToUas } from '@store/griffin_api/uas/models/IUAS';

// API Slice
export const uavApi = createApi({
  reducerPath: 'uavApi',
  baseQuery: authFetchBaseQuery({ baseUrl: UAS_BASE_URL }),
  keepUnusedDataFor: 300,
  tagTypes: ['UAV'],
  endpoints: (builder) => ({
    getUAV: builder.query<IUAS[], { uic: string; search?: string }>({
      query: ({ uic, search }) => {
        const params = new URLSearchParams();
        if (uic) params.append('uic', uic);
        if (search) params.append('search', search);
        return `uav?${params}`;
      },
      transformResponse: (response: IUasDto[]) => response.map(mapToUas),
      providesTags: ['UAV'],
    }),
    editUavEquipment: builder.mutation<IUasOut, { id: number; payload: IUASIn }>({
      query: (payload) => ({
        url: `/uav/${payload.id}`,
        method: 'PUT',
        body: mapIUasInToDto(payload.payload),
      }),
      invalidatesTags: ['UAV'],
    }),
  }),
});

// Hooks
export const { useGetUAVQuery, useEditUavEquipmentMutation } = uavApi;
