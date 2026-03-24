import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const data = '{"foo":"foo","bar":"bar"}';

export const mockApiSlice = createApi({
  reducerPath: 'mockApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_AMAP_API_URL}` }),
  endpoints: (build) => ({
    fooBar: build.query({
      queryFn: async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 2500)); // Reduced timeout for testing
          return { data };
        } catch (error) {
          console.error('Error occurred:', error);
          return { error: { status: 'CUSTOM_ERROR', error: 'Request failed' } };
        }
      },
    }),
  }),
});

export const mockApiReducer = mockApiSlice.reducer;
export const { useFooBarQuery } = mockApiSlice;
