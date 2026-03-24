import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { READINESS_BASE_URL } from '@store/griffin_api/base_urls';

import { IMissionsFlownDataSet, IMissionsFlownSummaryDataSet } from '../models';
import { IMissionsFlownDetailDataSet } from '../models/IMissionsFlownDetailDataSet';

// Api Slice
export const missionsFlownApi = createApi({
  reducerPath: 'readinessMissionsFlownApi',
  baseQuery: authFetchBaseQuery({ baseUrl: READINESS_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    getMissionsFlown: build.query({
      query: ({ uic, start_date, end_date }) => {
        return {
          url: `/missions-flown`,
          params: {
            uic,
            start_date,
            end_date,
          },
        };
      },
      transformResponse: (response: IMissionsFlownDataSet[]) => response,
    }),
    getMissionsFlownDetail: build.query({
      query: ({ uic, mission_type, start_date, end_date }) => {
        return {
          url: `/missions-flown-detail`,
          params: {
            uic,
            mission_type,
            start_date,
            end_date,
          },
        };
      },
      transformResponse: (response: IMissionsFlownDetailDataSet[]) => response,
    }),
    getMissionsFlownSummary: build.query({
      query: ({ uic, start_date, end_date }) => {
        return {
          url: `/missions-flown-summary`,
          params: {
            uic,
            start_date,
            end_date,
          },
        };
      },
      transformResponse: (response: IMissionsFlownSummaryDataSet[]) => response,
    }),
  }),
});

// Hooks
export const {
  useGetMissionsFlownQuery,
  useGetMissionsFlownDetailQuery,
  useLazyGetMissionsFlownDetailQuery,
  useGetMissionsFlownSummaryQuery,
} = missionsFlownApi;
