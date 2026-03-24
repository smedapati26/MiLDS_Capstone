import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';

export const mosCodeBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/mos_code`;

export const mosCodeApiSlice = createApi({
  reducerPath: 'mosCodeApi',
  baseQuery: authFetchBaseQuery({ baseUrl: mosCodeBaseUrl }),
  endpoints: (builder) => ({
    getAllMOS: builder.query<{ mos: string; mos_description: string }[], void>({
      query: () => ({
        url: `/all`,
        method: 'GET',
      }),
    }),
  }),
});

// Reducer
export const mosCodeApiReducer = mosCodeApiSlice.reducer;

// Hooks
export const { useGetAllMOSQuery, useLazyGetAllMOSQuery } = mosCodeApiSlice;
