import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { FHP_BASE_URL } from '@store/griffin_api/base_urls';
import {
  IFhpProgress,
  IFhpProgressDto,
  IFhpProgressMulti,
  IFhpProgressMultiDto,
  IFhpSummary,
  IFhpSummaryDto,
  mapToFhpSummary,
  mapToIFhpProgress,
  mapToIFhpProgressMulti,
} from '@store/griffin_api/fhp/models';

interface IFhpParams {
  uic: string;
  startDate?: string;
  endDate?: string;
  year?: string;
}
interface IFhpMultiParams extends IFhpParams {
  uics: string[];
}

const getModifiedParams = (params: IFhpParams): URLSearchParams => {
  const modified_params = new URLSearchParams();
  modified_params.set('uic', params.uic);
  if (params.startDate) modified_params.set('start_date', params.startDate);
  if (params.endDate) modified_params.set('end_date', params.endDate);
  return modified_params;
};

// Api Slice
export const fhpApi = createApi({
  reducerPath: 'fhpApi',
  baseQuery: authFetchBaseQuery({ baseUrl: FHP_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getFhpSummary: builder.query<IFhpSummary, IFhpParams>({
      query: (args: IFhpParams) => {
        return {
          url: 'flight-hours-summary',
          params: getModifiedParams(args),
        };
      },
      transformResponse: (response: IFhpSummaryDto) => mapToFhpSummary(response),
    }),
    getFhpProgress: builder.query<IFhpProgress, IFhpParams>({
      query: (args: IFhpParams) => {
        const params = new URLSearchParams();
        if (args.uic) params.set('uic', args.uic);
        if (args.year) params.set('year', args.year);
        if (args.startDate) params.set('start_date', args.startDate);
        if (args.endDate) params.set('end_date', args.endDate);

        return {
          url: 'fhp-progress',
          params: params,
        };
      },
      transformResponse: (response: IFhpProgressDto) => mapToIFhpProgress(response),
    }),
    getFhpProgressMultipleUnits: builder.query<IFhpProgressMulti[], IFhpMultiParams>({
      query: (args: IFhpMultiParams) => {
        const params = new URLSearchParams();

        if (args.uics) args.uics.map((uic) => params.append('similar_units', uic));
        if (args.year) params.set('year', args.year);
        if (args.startDate) params.set('start_date', args.startDate);
        if (args.endDate) params.set('end_date', args.endDate);

        return {
          url: 'fhp-progress-multiple-units',
          params: params,
        };
      },
      transformResponse: (response: IFhpProgressMultiDto[]) => response.map(mapToIFhpProgressMulti),
    }),
  }),
});

// Hook
export const { useGetFhpSummaryQuery, useGetFhpProgressQuery, useGetFhpProgressMultipleUnitsQuery } = fhpApi;
