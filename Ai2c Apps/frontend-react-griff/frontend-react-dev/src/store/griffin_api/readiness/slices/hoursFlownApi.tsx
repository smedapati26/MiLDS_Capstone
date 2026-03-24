import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { READINESS_BASE_URL } from '@store/griffin_api/base_urls';

import { IHoursFlownModel, IHoursFlownSubordinate, IHoursFlownUnits } from '../models';

interface IHoursFlownParams {
  uic: string;
  start_date?: string;
  end_date?: string;
}

interface IHoursFlownSimilarUICParams extends IHoursFlownParams {
  similar_uics?: string[];
}

/**
 * Constructs URL search parameters from an IHoursFlownSimilarUICParams object
 *
 * This utility function converts the API query parameters into URLSearchParams format
 * suitable for HTTP requests. It handles both required and optional parameters,
 * including array parameters that need to be appended multiple times.
 *
 * @example
 * // Returns URLSearchParams with uic=123&start_date=2023-01-01&similar_uics=456&similar_uics=789
 * getModifiedParams({
 *   uic: '123',
 *   start_date: '2023-01-01',
 *   similar_uics: ['456', '789']
 * });
 */
const getModifiedParams = (params: IHoursFlownSimilarUICParams) => {
  const modified_params = new URLSearchParams();
  modified_params.set('uic', params.uic);
  if (params.start_date) modified_params.set('start_date', params.start_date);
  if (params.end_date) modified_params.set('end_date', params.end_date);
  if (params.similar_uics) params.similar_uics.forEach((uic) => modified_params.append('similar_uics', uic));
  return modified_params;
};

// API Slice
export const hoursFlownApi = createApi({
  reducerPath: 'readinessHoursFlownApi',
  baseQuery: authFetchBaseQuery({ baseUrl: READINESS_BASE_URL }),
  endpoints: (build) => ({
    getHoursFlownUnits: build.query({
      query: (params: IHoursFlownSimilarUICParams) => {
        return {
          url: `/hours-flown-unit`,
          params: getModifiedParams(params),
        };
      },
      transformResponse: (response: IHoursFlownUnits[]) => response,
    }),
    getHoursFlownSubordinates: build.query({
      query: (params: IHoursFlownSimilarUICParams) => {
        return {
          url: `/hours-flown-subordinate`,
          params: getModifiedParams(params),
        };
      },
      transformResponse: (response: IHoursFlownSubordinate[]) => response,
    }),
    getHoursFlownModels: build.query({
      query: (params: IHoursFlownParams) => {
        return {
          url: `/hours-flown-model`,
          params,
        };
      },
      transformResponse: (response: IHoursFlownModel[]) => response,
    }),
  }),
});

// Hooks
export const { useGetHoursFlownUnitsQuery, useGetHoursFlownSubordinatesQuery, useGetHoursFlownModelsQuery } =
  hoursFlownApi;
