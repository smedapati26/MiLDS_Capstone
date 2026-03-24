import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { EVENTS_BASE_URL } from '@store/griffin_api/base_urls';

interface MaintenanceSchedulerDataSet {
  reporting_period: string;
  unscheduled: number;
  scheduled: number;
}
export interface TransformedMaintenanceSchedulerResponse {
  unscheduled: { date: string; unscheduled: number }[];
  scheduled: { date: string; scheduled: number }[];
}

// API Slice
export const maintenanceCountsApi = createApi({
  reducerPath: 'eventMaintenanceCountsApi',
  baseQuery: authFetchBaseQuery({ baseUrl: EVENTS_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    getMaintenanceScheduler: build.query({
      query: ({ uic, start_date, end_date }) => {
        return {
          url: `/maintenance-counts`,
          params: {
            uic,
            start_date,
            end_date,
          },
        };
      },
      transformResponse: (response: MaintenanceSchedulerDataSet[]) => {
        const transformedResponse = response.map((item) => {
          return {
            date: item.reporting_period,
            unscheduled: item.unscheduled,
            scheduled: item.scheduled,
          };
        });

        return {
          unscheduled: transformedResponse.map(({ date, unscheduled }) => ({ date, unscheduled })),
          scheduled: transformedResponse.map(({ date, scheduled }) => ({ date, scheduled })),
        } as TransformedMaintenanceSchedulerResponse;
      },
    }),
  }),
});

// Hooks
export const { useGetMaintenanceSchedulerQuery } = maintenanceCountsApi;
