import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { mapResponseData } from '@utils/helpers/dataTransformer';

import { ICreateEventOut, ICreateMassEventOut, IDa7817s, IDa7817sDto, IUpdateEventOut } from '../models';

export const eventsBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/events`;

export const eventsApiSlice = createApi({
  reducerPath: 'eventsApi',
  baseQuery: authFetchBaseQuery({ baseUrl: eventsBaseUrl }),
  endpoints: (builder) => ({
    getEventById: builder.query<IDa7817s, { event_id: number }>({
      query: ({ event_id }) => ({
        url: `/${event_id}`,
        method: 'GET',
      }),
      transformResponse: (response: IDa7817sDto) => mapResponseData(response),
    }),
    getEventDocumentsById: builder.query<
      { id: number; title: string; filePath: string; type: string }[],
      { event_id: number }
    >({
      query: ({ event_id }) => ({
        url: `/${event_id}/documents`,
        method: 'GET',
      }),
      transformResponse: (response: { id: number; title: string; file_path: string; type: string }[]) =>
        mapResponseData(response),
    }),
    getEventTypes: builder.query<{ type: string; description: string }[], null>({
      query: () => ({
        url: `/event_types`,
        method: 'GET',
      }),
      transformResponse: (response: { Type: string; Description: string }[]) => mapResponseData(response),
    }),
    getEvaluationTypes: builder.query<{ type: string; description: string }[], null>({
      query: () => ({
        url: `/evaluation_types`,
        method: 'GET',
      }),
      transformResponse: (response: { Type: string; Description: string }[]) => mapResponseData(response),
    }),
    getAwardTypes: builder.query<{ type: string; description: string }[], null>({
      query: () => ({
        url: `/award_types`,
        method: 'GET',
      }),
      transformResponse: (response: { Type: string; Description: string }[]) => mapResponseData(response),
    }),
    getTrainingTypes: builder.query<{ type: string; description: string }[], null>({
      query: () => ({
        url: `/training_types`,
        method: 'GET',
      }),
      transformResponse: (response: { Type: string; Description: string }[]) => mapResponseData(response),
    }),
    getTCSLocations: builder.query<{ abbreviation: string; location: string }[], null>({
      query: () => ({
        url: `/tcs_locations`,
        method: 'GET',
      }),
      transformResponse: (response: { abbreviation: string; location: string }[]) => mapResponseData(response),
    }),
    getDa7817s: builder.query<IDa7817s[], { user_id: string }>({
      query: ({ user_id }) => ({
        url: `/user/${user_id}`,
        method: 'GET',
      }),
      transformResponse: (response: IDa7817sDto[]) => mapResponseData(response),
    }),
    createEvent: builder.mutation<ICreateEventOut, ICreateEventOut>({
      query: (data) => {
        return {
          url: `/${data.user_id}/add_7817`,
          method: 'POST',
          body: data,
        };
      },
    }),
    createMassEvent: builder.mutation<ICreateMassEventOut, ICreateMassEventOut>({
      query: (data) => {
        return {
          url: `/mass_training`,
          method: 'POST',
          body: data,
        };
      },
    }),
    updateEvent: builder.mutation<IUpdateEventOut, IUpdateEventOut>({
      query: (data) => {
        const { id, ...bodyData } = data;
        return {
          url: `/${id}`,
          method: 'PUT',
          body: bodyData,
        };
      },
    }),
    deleteEvent: builder.mutation<string, number>({
      query: (eventId) => {
        return {
          url: `/${eventId}`,
          method: 'DELETE',
        };
      },
    }),
    uploadXMLFile: builder.mutation<
      {
        soldierRecords: IDa7817s[];
        soldierInfo: { ML: string; DOD_ID: string; rank_progression: { rank: string; date: string }[] };
      },
      { soldier_id: string; file: File }
    >({
      query: ({ soldier_id, file }) => {
        const formData = new FormData();
        formData.append('xml_file', file);

        return {
          url: `/ingest_7817_xml/${soldier_id}`,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: {
        Solider_records: IDa7817sDto[];
        Soldier_info: { ML: string; DOD_ID: string; rank_progression: { rank: string; date: string }[] };
      }) => mapResponseData(response),
    }),
  }),
});

// Reducer
export const eventsApiReducer = eventsApiSlice.reducer;

// Hooks
export const {
  useLazyGetEventByIdQuery,
  useGetEventTypesQuery,
  useLazyGetEventDocumentsByIdQuery,
  useLazyGetEventTypesQuery,
  useLazyGetTrainingTypesQuery,
  useLazyGetEvaluationTypesQuery,
  useLazyGetAwardTypesQuery,
  useLazyGetTCSLocationsQuery,
  useGetEvaluationTypesQuery,
  useGetDa7817sQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useCreateMassEventMutation,
  useUploadXMLFileMutation,
  useDeleteEventMutation,
} = eventsApiSlice;
