import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { FAULTS_BASE_URL } from '@store/griffin_api/base_urls';

import { IFaultOverTime } from '../models/IFaultOverTime';

// API Slice
export const faultsOverTimeApi = createApi({
  reducerPath: 'faultsApi',
  baseQuery: authFetchBaseQuery({ baseUrl: FAULTS_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    getFaultsOverTime: build.query({
      query: ({ uic, start_date, end_date }) => {
        return {
          url: `/faults-over-time`,
          params: {
            uic,
            start_date,
            end_date,
          },
        };
      },
      transformResponse: (response: IFaultOverTime[]) => response,
    }),
  }),
});

// Hooks
export const { useGetFaultsOverTimeQuery } = faultsOverTimeApi;
