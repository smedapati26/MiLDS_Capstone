import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';

import { PERSONNEL_UNIT_BASE_URL } from '../../base_urls';
import { IMaintenancePersonnelCount } from '../models/IMaintenancePersonnelCount';

// API Slice
export const unavailablePersonnelApi = createApi({
  reducerPath: 'amapUnavailablePersonnelApi',
  baseQuery: authFetchBaseQuery({ baseUrl: PERSONNEL_UNIT_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    getUnavailablePersonnel: build.query({
      query: ({ uic, start_date, end_date }) => {
        return {
          url: `/unavailable`,
          params: {
            uic,
            start_date,
            end_date,
          },
        };
      },
      transformResponse: (response: IMaintenancePersonnelCount[]) => response,
    }),
  }),
});

// Hooks
export const { useGetUnavailablePersonnelQuery } = unavailablePersonnelApi;
