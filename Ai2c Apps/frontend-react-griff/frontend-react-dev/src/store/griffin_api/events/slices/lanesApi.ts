// Import the RTK Query methods from the React-specific entry point
import { createApi } from '@reduxjs/toolkit/query/react';

import { IPagedData } from '@models/IPagedData';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { EVENTS_BASE_URL } from '@store/griffin_api/base_urls';

import { EventsTagEnum } from '../cacheTags';
import { IMaintenanceLaneDto, mapToILane } from '../models';

// Api Slice
export const lanesApi = createApi({
  reducerPath: 'eventsLanesApi',
  baseQuery: authFetchBaseQuery({ baseUrl: EVENTS_BASE_URL }),
  keepUnusedDataFor: 300,
  tagTypes: [EventsTagEnum.MAINTENANCE_EVENTS, EventsTagEnum.MAINTENANCE_LANES],
  endpoints: (builder) => ({
    getLanes: builder.query({
      query: (uic: string) => `/maintenance-lanes?uic=${uic}`,
      transformResponse: (response: IPagedData<IMaintenanceLaneDto>) => response.items.map(mapToILane),
      providesTags: [EventsTagEnum.MAINTENANCE_EVENTS],
    }),
    addLane: builder.mutation({
      query: (lane) => ({
        url: '/maintenance-lane',
        method: 'POST',
        body: lane,
      }),
      invalidatesTags: [EventsTagEnum.MAINTENANCE_EVENTS],
    }),
    deleteLane: builder.mutation({
      query: (id) => ({
        url: `/maintenance-lane/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [EventsTagEnum.MAINTENANCE_EVENTS, EventsTagEnum.MAINTENANCE_LANES],
    }),
    updateLane: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/maintenance-lane/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [EventsTagEnum.MAINTENANCE_EVENTS],
    }),
  }),
});

// Hooks
export const { useGetLanesQuery, useAddLaneMutation, useUpdateLaneMutation, useDeleteLaneMutation } = lanesApi;
