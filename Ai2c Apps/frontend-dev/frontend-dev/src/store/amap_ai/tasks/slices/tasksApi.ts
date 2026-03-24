import { createApi } from '@reduxjs/toolkit/query/react';

import { ITasksDto, IUCTLTasks, IUCTLTasksDto, SearchResponse } from '@features/task-explorer/models/ITasks';
import { createQueryString } from '@utils/helpers';
import { mapResponseData } from '@utils/helpers/dataTransformer';

import { authFetchBaseQuery } from '../../../authFetchBaseQuery';
import { CreateUctlPayload, UpdateTaskPayload, UpdateUctlPayload } from '../models';

export const tasksBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/tasks`;

export const tasksApiSlice = createApi({
  reducerPath: 'tasksApi',
  baseQuery: authFetchBaseQuery({ baseUrl: tasksBaseUrl }),
  endpoints: (builder) => ({
    getUserTasks: builder.query<
      { taskNumber: string; taskTitle: string; mos: string }[],
      { user_id: string; all_tasks?: boolean }
    >({
      query: ({ user_id, all_tasks = false }) => ({
        url: `/${user_id}/searchable_tasklist`,
        method: 'GET',
        params: {
          all_tasks,
        },
      }),
      transformResponse: (response: { task_number: string; task_title: string; mos: string }[]) =>
        mapResponseData(response),
    }),
    getUnitTasks: builder.query<
      { uctls: IUCTLTasks[]; totalCount: number },
      { uic: string; mos?: string; skill_level?: string }
    >({
      query: ({ uic, mos, skill_level }) => ({
        url: `/unit/uctls`,
        method: 'GET',
        params: {
          uic,
          mos,
          skill_level,
        },
      }),
      transformResponse: (response: { uctls: IUCTLTasksDto[]; total_count: number }) => mapResponseData(response),
    }),
    getTasksByType: builder.query<SearchResponse, { query: string; search_type: 'UCTL' | 'TASK' }>({
      query: ({ query, search_type }) => ({
        url: `/search`,
        method: 'GET',
        params: {
          query,
          search_type,
          threshold: 30,
        },
      }),
      transformResponse: (response: SearchResponse) => mapResponseData(response),
    }),
    getAllTasks: builder.query({
      query: ({ limit, offset, query, mos, skill_level, proponent }) => {
        const queryParams = createQueryString({
          limit,
          offset,
          ...(query ? { query } : {}),
          ...(mos?.length ? { mos } : {}),
          ...(skill_level?.length ? { skill_level } : {}),
          ...(proponent?.length ? { proponent } : {}),
        });

        return `/all?${queryParams}`;
      },
      transformResponse: (response: ITasksDto[]) => mapResponseData(response),
    }),
    createTask: builder.mutation<{ task_number: string; message: string }, FormData>({
      query: (body) => ({
        url: `/tasks`,
        method: 'POST',
        body,
      }),
    }),
    updateTask: builder.mutation<{ task_number: string }, UpdateTaskPayload>({
      query: ({ task_number, ...body }) => ({
        url: `/tasks/${task_number}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteTask: builder.mutation<{ task_number: string; deleted: boolean; message: string }, { task_number: string }>({
      query: ({ task_number }) => ({
        url: `/tasks/${task_number}`,
        method: 'DELETE',
      }),
    }),
    uploadTaskPdf: builder.mutation<{ task_number: string }, { task_number: string; unit_task_pdf: File }>({
      query: ({ task_number, unit_task_pdf }) => {
        const formData = new FormData();
        formData.append('unit_task_pdf', unit_task_pdf);

        return {
          url: `/data/v1/tasks/tasks/${task_number}/upload`,
          method: 'POST',
          body: formData,
        };
      },
    }),
    downloadTask: builder.query<Blob | null, { task_number: string }>({
      queryFn: async ({ task_number }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `/tasks/${task_number}/file`,
          method: 'GET',
          responseHandler: (response) => response.blob(),
        });

        if (result.error) {
          return { error: result.error };
        }

        const blobData = result.data as Blob;

        if (blobData.size !== 4) {
          return { data: blobData };
        }

        return { data: null };
      },
    }),
    createUctl: builder.mutation<void, CreateUctlPayload>({
      query: (body) => ({
        url: `/uctls`,
        method: 'POST',
        body,
      }),
    }),
    updateUctl: builder.mutation<void, UpdateUctlPayload>({
      query: ({ ictl_id, ...body }) => ({
        url: `/uctls/${ictl_id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteUCTL: builder.mutation<
      { deleted_ictl: boolean; deleted_tasks_count: number; message: string },
      { ictl_id: number }
    >({
      query: ({ ictl_id }) => ({
        url: `/uctls/${ictl_id}`,
        method: 'DELETE',
      }),
    }),
    checkDuplicate: builder.query<
      { matches: { title: string; similarity_score: number; ictl_id: number }[] },
      {
        proposed_title: string;
        mos_codes: string[];
        skill_levels: string[];
        threshold?: number;
      }
    >({
      query: ({ proposed_title, mos_codes, skill_levels, threshold = 75 }) => ({
        url: `/uctls/check_duplicate`,
        method: 'GET',
        params: {
          proposed_title,
          mos_codes,
          skill_levels,
          threshold,
        },
      }),
    }),
  }),
});

// Reducer
export const tasksApiReducer = tasksApiSlice.reducer;

// Hooks
export const {
  useCreateUctlMutation,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useLazyGetUserTasksQuery,
  useGetAllTasksQuery,
  useLazyGetUnitTasksQuery,
  useGetTasksByTypeQuery,
  useLazyGetTasksByTypeQuery,
  useLazyCheckDuplicateQuery,
  useUpdateUctlMutation,
  useUploadTaskPdfMutation,
  useDeleteTaskMutation,
  useDeleteUCTLMutation,
  useLazyDownloadTaskQuery,
} = tasksApiSlice;
