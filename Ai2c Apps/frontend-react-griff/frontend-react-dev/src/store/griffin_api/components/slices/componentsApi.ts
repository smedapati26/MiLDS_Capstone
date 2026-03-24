import { createApi } from '@reduxjs/toolkit/query/react';

import { IPagedData } from '@models/IPagedData';
import { IUnitDateRange } from '@models/IUnitDateRange';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { COMPONENTS_BASE_URL } from '@store/griffin_api/base_urls';

import {
  IAircraftRiskFilters,
  IAircraftRiskPrediction,
  IComponentFailurePredictionsParams,
  IComponentRiskFilters,
  IComponentRiskPrediction,
  IFailureCount,
  IFailureCountDto,
  ILongevity,
  IModelRiskFilters,
  IPartListItem,
  IShortLife,
  IShortLifeComponentDto,
  ISurvivalPredictionDto,
  mapToIFailureCount,
  mapToIShortLife,
} from '../models';

// API Slice
export const componentsApi = createApi({
  reducerPath: 'componentsApi',
  baseQuery: authFetchBaseQuery({ baseUrl: COMPONENTS_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getShortLife: builder.query<IShortLife[], { uic: string; include_na?: string }>({
      query: ({ uic, include_na = 'false' }) => ({
        url: '/full-short-life',
        method: 'GET',
        params: {
          uic,
          include_na,
        },
      }),
      transformResponse: (response: IShortLifeComponentDto[]) => response.map(mapToIShortLife),
    }),
    getFailureCount: builder.query<IFailureCount[], { uic: string; hour: number; failure_percentage?: number }>({
      query: ({ uic, hour, failure_percentage }) => ({
        url: '/failure-count',
        method: 'GET',
        params: {
          uic,
          hour,
          failure_percentage,
        },
      }),
      transformResponse: (response: IFailureCountDto[]) => response.map(mapToIFailureCount),
    }),
    exportChecklist: builder.mutation({
      query: () => ({
        url: '/comp-checklist-export',
        method: 'GET',
      }),
    }),
    getSurvivalPredictions: builder.query<ISurvivalPredictionDto[], IUnitDateRange>({
      query: (arg: IUnitDateRange) => `/surv-preds?uic=${arg.uic}`,
      transformResponse: (response: IPagedData<ISurvivalPredictionDto>) => response.items,
    }),
    getAircraftRiskPredictions: builder.query<IAircraftRiskPrediction[], IAircraftRiskFilters>({
      query: ({ uic, variant, serial_numbers = [], other_uics = [], part_numbers = [] }) => {
        const params = new URLSearchParams();
        params.append('uic', uic);
        if (variant) {
          params.append('variant', variant);
        }
        if (!variant) {
          serial_numbers.forEach((sn) => params.append('serial_numbers', sn));
        }
        if (part_numbers?.length) {
          part_numbers.forEach((pn) => params.append('part_numbers', pn));
        }
        other_uics.forEach((uic) => params.append('other_uics', uic));
        return `/aircraft-risk?${params.toString()}`;
      },
    }),
    getComponentFailurePredictions: builder.query<IComponentRiskPrediction[], IComponentFailurePredictionsParams>({
      query: (params) => ({
        url: '/failure-preds',
        params,
      }),
    }),
    getComponentPartList: builder.query<IPartListItem[], { uic: string; serial?: string }>({
      query: ({ uic, serial }) => {
        const params = new URLSearchParams();
        params.append('uic', uic);

        if (serial) {
          params.append('serial', serial);
        }
        return {
          url: '/part-list',
          params,
        };
      },
      transformResponse: (response: { part_number: string; models: string[] }[]) =>
        response.map((partsData) => {
          return {
            part_number: partsData.part_number,
            models: partsData.models,
          };
        }),
    }),
    getComponentRisk: builder.query<IComponentRiskPrediction[], IComponentRiskFilters>({
      query: ({ uic, variant, serial_numbers, part_numbers, other_uics = [], serial }) => {
        const params = new URLSearchParams();
        params.append('uic', uic);
        if (variant) {
          params.append('variant', variant);
        }
        if (serial) {
          params.append('serial', serial);
        }
        if (!variant) {
          if (serial_numbers?.length) {
            serial_numbers.forEach((sn) => params.append('serial_numbers', sn));
          }
          if (part_numbers?.length) {
            part_numbers.forEach((pn) => params.append('part_numbers', pn));
          }
        }
        other_uics.forEach((uic) => params.append('other_uics', uic));
        return `/component-risk?${params.toString()}`;
      },
    }),
    getModelRiskPredictions: builder.query<IAircraftRiskPrediction[], IModelRiskFilters>({
      query: ({ uic, part_number }) => {
        const params = new URLSearchParams();
        params.append('uic', uic);
        params.append('part_number', part_number);
        return `/model-risk?${params.toString()}`;
      },
    }),
    getLongevity: builder.query<ILongevity, { uic: string; part_number: string }>({
      query: ({ uic, part_number }) => ({
        url: '/longevity',
        params: { uic, part_number },
      }),
    }),
  }),
});

// Hooks
export const {
  useGetShortLifeQuery,
  useGetSurvivalPredictionsQuery,
  useGetAircraftRiskPredictionsQuery,
  useGetComponentFailurePredictionsQuery,
  useGetComponentRiskQuery,
  useGetComponentPartListQuery,
  useGetFailureCountQuery,
  useExportChecklistMutation,
  useGetModelRiskPredictionsQuery,
  useGetLongevityQuery,
} = componentsApi;
