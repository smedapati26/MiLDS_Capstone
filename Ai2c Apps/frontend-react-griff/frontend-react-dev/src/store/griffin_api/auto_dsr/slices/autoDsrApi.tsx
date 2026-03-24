import { createApi } from '@reduxjs/toolkit/query/react';

import { IPagedData } from '@models/IPagedData';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { AUTO_DSR_BASE_URL } from '@store/griffin_api/base_urls';

import {
  IAcdHistoryOut,
  IAcdHistoryOutDto,
  IAutoDsrDto,
  IAutoDsrLocation,
  IAutoDsrLocationDto,
  IAutoDsrSingleUnitInfo,
  IAutoDsrSingleUnitInfoDto,
  mapToAcdHistoryOut,
  mapToAutoDsrSingleUnitInfo,
  mapToIAutoDsrLocation,
} from '../models/IAutoDsr';
import { IAutoDsrTransform, transformAutoDsr } from '../transforms/autoDsrTransform';

/* Auto Dsr API Slice */
export const autoDsrApi = createApi({
  reducerPath: 'autoDsrApi',
  baseQuery: authFetchBaseQuery({ baseUrl: AUTO_DSR_BASE_URL }),
  tagTypes: ['AcdHistory', 'Aircraft'],
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    /* Status Over Time */
    getAutoDsr: build.query({
      query: ({ uic }) => {
        return {
          url: '',
          params: {
            uic,
          },
        };
      },
      transformResponse: (response: IAutoDsrDto[]): IAutoDsrTransform => transformAutoDsr(response),
      providesTags: ['Aircraft'],
    }),
    getAutoDsrLocation: build.query<
      IPagedData<IAutoDsrLocationDto>,
      { id?: string; name?: string; code?: string; limit?: number; offset?: number }
    >({
      query: ({ id, name, code, limit = 10, offset = 0 }) => {
        const params = new URLSearchParams();
        if (name) params.append('name', name);
        if (code) params.append('code', code);
        if (id) params.append('id', id);
        params.append('limit', limit as unknown as string);
        params.append('offset', offset as unknown as string);

        return `/models/location?${params}`;
      },
      keepUnusedDataFor: 300,
      transformResponse: (response: IPagedData<IAutoDsrLocationDto>): IPagedData<IAutoDsrLocation> => {
        return {
          ...response,
          items: response.items.map(mapToIAutoDsrLocation),
        };
      },
    }),
    getAutoDsrSingleUnitInfo: build.query<IAutoDsrSingleUnitInfo, { uic: string }>({
      query: ({ uic }) => {
        return {
          url: `unit/${uic}`,
        };
      },
      transformResponse: (response: IAutoDsrSingleUnitInfoDto) => mapToAutoDsrSingleUnitInfo(response),
    }),
    getAcdUploadHistory: build.query<IPagedData<IAcdHistoryOut>, { uic?: string; search?: string }>({
      query: ({ uic, search }) => {
        const params = new URLSearchParams();
        if (uic) params.append('unit', uic);
        if (search) params.append('search', search);
        return {
          url: 'acd/history',
          params: params,
        };
      },
      transformResponse: (response: IPagedData<IAcdHistoryOutDto>): IPagedData<IAcdHistoryOut> => {
        return {
          ...response,
          items: response.items.map(mapToAcdHistoryOut),
        };
      },
    }),
    getAcdUploadLatestHistory: build.query<IAcdHistoryOut, { uic?: string }>({
      query: ({ uic }) => {
        const params = new URLSearchParams();
        if (uic) params.append('unit', uic);
        return {
          url: 'acd/latest_history',
          params: params,
        };
      },
      transformResponse: (response: IAcdHistoryOutDto): IAcdHistoryOut => mapToAcdHistoryOut(response),
    }),
    uploadAcd: build.mutation<
      { message: string; export_id?: number | string },
      { uic: string; sync?: boolean; processFile?: boolean; acdFile: File }
    >({
      query: ({ uic, sync = false, processFile = false, acdFile }) => {
        const formData = new FormData();
        formData.append('acd_file', acdFile);

        const params = new URLSearchParams();
        params.append('uic', uic);
        params.append('sync', sync.toString());
        params.append('process_file', processFile.toString());

        return {
          url: 'acd/upload',
          method: 'POST',
          body: formData,
          params: params,
        };
      },
      invalidatesTags: ['AcdHistory'], // Invalidate history cache after upload
    }),
    cancelAcdUpload: build.mutation<{ message: string }, { id: number | string | undefined }>({
      query: ({ id }) => ({
        url: `acd/cancel/${id}`,
        method: 'PUT',
      }),
      invalidatesTags: ['AcdHistory'], // Invalidate history cache after cancellation
    }),
    downloadAcdFile: build.mutation<void, { id: number; fileName?: string }>({
      queryFn: async ({ id, fileName }, _api, _extraOptions, baseQuery) => {
        try {
          const result = await baseQuery({
            url: `acd/download/${id}`,
            responseHandler: (response) => response.blob(),
          });

          if (result.error) {
            return { error: result.error };
          }

          const blob = result.data as Blob;
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName || `acd-file-${id}.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          return { data: undefined };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
    }),
  }),
});

// Hooks
export const {
  useGetAutoDsrQuery,
  useGetAutoDsrLocationQuery,
  useGetAutoDsrSingleUnitInfoQuery,
  useGetAcdUploadHistoryQuery,
  useGetAcdUploadLatestHistoryQuery,
  useUploadAcdMutation,
  useCancelAcdUploadMutation,
  useDownloadAcdFileMutation,
} = autoDsrApi;
