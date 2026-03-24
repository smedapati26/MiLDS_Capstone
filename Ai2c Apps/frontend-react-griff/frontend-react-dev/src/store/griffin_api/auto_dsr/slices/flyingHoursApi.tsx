import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { AUTO_DSR_BASE_URL } from '@store/griffin_api/base_urls';

import { IFlyingHours, IFlyingHoursDto, mapToIFlyingHours } from '../models/IFlyingHours';

// API slice
export const flyingHoursApi = createApi({
  reducerPath: 'flyingHoursApi',
  baseQuery: authFetchBaseQuery({ baseUrl: AUTO_DSR_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    getFlyingHours: build.query({
      query: ({ uic }) => {
        return {
          url: `/flying-hours`,
          params: {
            uic,
          },
        };
      },
      transformResponse: (response: IFlyingHoursDto): IFlyingHours => mapToIFlyingHours(response),
    }),
  }),
});

// Hooks
export const { useGetFlyingHoursQuery } = flyingHoursApi;
