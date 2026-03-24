import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';

import { ICreateDA4856Out, IDA4856, IDA4856DTO, IUpdateDA4856Out, mapToIDA4856 } from '../models';

export const counselingsBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/counseling`;

export const counselingsApiSlice = createApi({
  reducerPath: 'counselingsApiSlice',
  baseQuery: authFetchBaseQuery({ baseUrl: counselingsBaseUrl }),
  endpoints: (builder) => ({
    getCounselings: builder.query<IDA4856[], { soldier_id: string }>({
      query: ({ soldier_id }) => ({
        url: `/soldier/${soldier_id}`,
        method: 'GET',
      }),
      transformResponse: (response: IDA4856DTO[]): IDA4856[] => {
        return response.map(mapToIDA4856);
      },
    }),
    updateCounseling: builder.mutation<
      { message: string; success: boolean },
      { counseling_id: number; data: IUpdateDA4856Out }
    >({
      query: ({ counseling_id, data }) => {
        return {
          url: `/${counseling_id}`,
          method: 'PUT',
          body: data,
        };
      },
    }),
    getCounselingDocument: builder.query<File | null, { soldier_id: string; da_4856_id: string }>({
      queryFn: async ({ soldier_id, da_4856_id }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `/soldier/${soldier_id}/document/${da_4856_id}`,
          method: 'GET',
          responseHandler: (response) => response.blob(),
        });

        if (result.error) {
          return { error: result.error };
        }

        const blobData = result.data as Blob;

        if (blobData.size !== 4) {
          return {
            data: new File([blobData], `Counseling Document ${da_4856_id} for soldier ${soldier_id}.pdf`, {
              type: blobData.type,
            }),
          };
        }

        return { data: null };
      },
    }),
    createCounseling: builder.mutation<
      { message: string },
      { soldier_id: string; data: ICreateDA4856Out; file: File | null }
    >({
      query: ({ soldier_id, data, file }) => {
        const formData = new FormData();

        if (file) {
          formData.append('pdf', file);
        }
        formData.append('title', data.title);
        formData.append('date', data.date.toISOString().slice(0, 10));
        if (data.associated_event_id) {
          formData.append('related_designation_id', data.associated_event_id);
        }

        return {
          url: `/soldier/counseling/${soldier_id}`,
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

// Reducer
export const counselingsApiReducer = counselingsApiSlice.reducer;

// Hooks
export const {
  useGetCounselingsQuery,
  useUpdateCounselingMutation,
  useGetCounselingDocumentQuery,
  useCreateCounselingMutation,
} = counselingsApiSlice;

export const { getCounselingDocument } = counselingsApiSlice.endpoints;
