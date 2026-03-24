import dayjs from 'dayjs';

import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { EVENTS_BASE_URL } from '@store/griffin_api/base_urls';

import { IMaintenanceDetailsDto } from '../models';

export const maintenanceDetailsApi = createApi({
  reducerPath: 'eventsMaintenanceDetailsApi',
  baseQuery: authFetchBaseQuery({ baseUrl: EVENTS_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    getMaintenanceDetails: build.query({
      query: ({ uic }) => {
        return {
          url: `/dsr-maintenance-detail`,
          params: {
            uic: uic,
          },
        };
      },
      transformResponse: (response: IMaintenanceDetailsDto[]) =>
        response.map((item) => ({
          ...item,
          start_date: dayjs(item.start_date).format('MM/DD/YYYY'), // Format start_date
          end_date: dayjs(item.end_date).format('MM/DD/YYYY'), // Format end_date
        })),
    }),
  }),
});

export const { useGetMaintenanceDetailsQuery } = maintenanceDetailsApi;
