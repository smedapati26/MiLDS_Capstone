import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { READINESS_BASE_URL } from '@store/griffin_api/base_urls';

import { IStatusOverTime, IStatusOverTimeDto, mapToIStatusOverTime } from '../models';

export const statusOverTimeApi = createApi({
  reducerPath: 'readinessStatusOverTimeApi',
  baseQuery: authFetchBaseQuery({ baseUrl: READINESS_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    /* Status Over Time */
    getStatusOverTime: build.query({
      query: ({ uic, start_date, end_date }) => {
        return {
          url: `/status-over-time`,
          params: {
            uic,
            start_date,
            end_date,
          },
        };
      },
      transformResponse: (response: IStatusOverTimeDto[]): IStatusOverTime[] => response.map(mapToIStatusOverTime),
    }),
  }),
});

export const { useGetStatusOverTimeQuery } = statusOverTimeApi;
