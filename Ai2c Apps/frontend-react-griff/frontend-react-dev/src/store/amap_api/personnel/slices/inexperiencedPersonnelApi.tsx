import { createApi } from '@reduxjs/toolkit/query/react';

import { PERSONNEL_UNIT_BASE_URL } from '@store/amap_api/base_urls';
import { authFetchBaseQuery } from '@store/authFetchBaseQuery';

import { IMaintenancePersonnelCount } from '../models/IMaintenancePersonnelCount';

// API Slice
export const inexperiencedPersonnelApi = createApi({
  reducerPath: 'amapInexperiencedPersonnelApi',
  baseQuery: authFetchBaseQuery({ baseUrl: PERSONNEL_UNIT_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    getInexperiencedPersonnel: build.query({
      query: ({ uic, start_date, end_date }) => {
        return {
          url: `/inexperienced`,
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
export const { useGetInexperiencedPersonnelQuery } = inexperiencedPersonnelApi;
