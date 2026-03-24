import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';

import {
  ICreateSoldierDesignationDTO,
  IDesignation,
  ISoldierDesignation,
  ISoldierDesignationDTO,
  mapToISoldierDesignation,
} from '../models';

export const designationBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/designation`;

export const designationApiSlice = createApi({
  reducerPath: 'designationApi',
  baseQuery: authFetchBaseQuery({ baseUrl: designationBaseUrl }),
  endpoints: (builder) => ({
    getSoldierDesignations: builder.query<ISoldierDesignation[], { user_id: string; current: boolean }>({
      query: ({ user_id, current }) => ({
        url: `/soldier/${user_id}`,
        params: { current },
        method: 'GET',
      }),
      transformResponse: (response: ISoldierDesignationDTO[]) => {
        return response.map(mapToISoldierDesignation);
      },
    }),
    getAllDesignations: builder.query<IDesignation[], void>({
      query: () => ({
        url: ``,
        method: 'GET',
      }),
    }),
    deleteDesignation: builder.mutation<{ message: string; success: boolean }, number>({
      query: (designationId) => ({
        url: `/${designationId}`,
        method: 'DELETE',
      }),
    }),
    createDesignation: builder.mutation<{ message: string }, { data: ICreateSoldierDesignationDTO; file: File | null }>(
      {
        query: ({ data, file }) => {
          const formData = new FormData();

          if (file) {
            formData.append('file', file);
          }

          formData.append('soldier_id', data.soldier_id);
          formData.append('unit_uic', data.unit_uic);
          formData.append('designation', data.designation);
          formData.append('start_date', data.start_date);
          if (data.end_date) {
            formData.append('end_date', data.end_date);
          }
          if (data.supporting_document_id) {
            formData.append('supporting_document_id', data.supporting_document_id.toString());
          }

          return {
            url: ``,
            method: 'POST',
            body: formData,
          };
        },
      },
    ),
  }),
});

// Reducer
export const designationApiReducer = designationApiSlice.reducer;

// Hooks
export const {
  useGetSoldierDesignationsQuery,
  useGetAllDesignationsQuery,
  useDeleteDesignationMutation,
  useCreateDesignationMutation,
} = designationApiSlice;
