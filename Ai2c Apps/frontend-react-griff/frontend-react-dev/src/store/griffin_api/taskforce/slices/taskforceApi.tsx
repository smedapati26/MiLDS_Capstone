import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { TASKFORCE_BASE_URL } from '@store/griffin_api/base_urls';

import {
  ITaskForceDetailsDto,
  ITaskForceSimpleDto,
  mapToITaskForceDetails,
  mapToITaskForceSimple,
} from '../models/ITaskforce';
import { IUserEquipmentsDto, mapToUserEquipments } from '../models/IUserEquipment';

// API slice
export const taskforceApi = createApi({
  reducerPath: 'taskforceApi',
  baseQuery: authFetchBaseQuery({ baseUrl: TASKFORCE_BASE_URL }),
  tagTypes: ['TaskForces'],
  endpoints: (builder) => ({
    createTaskforce: builder.mutation({
      query: (formData) => ({
        url: '',
        method: 'POST',
        body: formData,
        cache: 'no-cache',
      }),
      invalidatesTags: ['TaskForces'],
    }),
    getUserEquipment: builder.query({
      query: () => ({ url: '/user-equipment' }),
      transformResponse: (response: IUserEquipmentsDto) => mapToUserEquipments(response),
    }),
    getTaskforces: builder.query({
      query: ({ archived, startDate, endDate }) => {
        const params = new URLSearchParams();
        params.append('archived', archived);
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        return {
          url: '',
          params: params,
        };
      },
      transformResponse: (response: ITaskForceSimpleDto[]) => response.map(mapToITaskForceSimple),
      providesTags: ['TaskForces'],
    }),
    getTaskforceDetails: builder.query({
      query: (uic) => ({
        url: `/${uic}`,
        method: 'GET',
      }),
      transformResponse: (response: ITaskForceDetailsDto) => mapToITaskForceDetails(response),
      providesTags: ['TaskForces'],
    }),
    updateTaskforceUnit: builder.mutation({
      query: ({ uic, formData }) => ({
        url: `/edit-unit/${uic}`,
        method: 'POST',
        body: formData,
        cache: 'no-cache',
      }),
      invalidatesTags: ['TaskForces'],
    }),
    updateTaskforceEquipment: builder.mutation({
      query: ({ uic, formData }) => ({
        url: `/edit-equipment/${uic}`,
        method: 'POST',
        body: formData,
        cache: 'no-cache',
      }),
      invalidatesTags: ['TaskForces'],
    }),
    deleteTaskforce: builder.mutation({
      query: (uic) => ({
        url: `/${uic}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TaskForces'],
    }),
  }),
});

// Export the auto-generated hook
export const {
  useGetUserEquipmentQuery,
  useCreateTaskforceMutation,
  useGetTaskforcesQuery,
  useGetTaskforceDetailsQuery,
  useUpdateTaskforceUnitMutation,
  useUpdateTaskforceEquipmentMutation,
  useDeleteTaskforceMutation,
} = taskforceApi;
