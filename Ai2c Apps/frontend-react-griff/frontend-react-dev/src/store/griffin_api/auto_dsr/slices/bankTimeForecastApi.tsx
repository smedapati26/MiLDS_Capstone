import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { AUTO_DSR_BASE_URL } from '@store/griffin_api/base_urls';

import { AutoDsrTagEnum } from '../cacheTags';
import { IBankTimeForecastDto, mapBankTimeForecast } from '../models/IBankTimeForecastDto';

// API slice
export const bankTimeForecastApi = createApi({
  reducerPath: 'bankTimeForecastApi',
  baseQuery: authFetchBaseQuery({ baseUrl: AUTO_DSR_BASE_URL }),
  keepUnusedDataFor: 300,
  tagTypes: [AutoDsrTagEnum.BANK_TIME_FORECAST],
  endpoints: (build) => ({
    getBankTime: build.query({
      query: ({ uic }) => {
        return {
          url: `/bank-time-forecast`,
          params: {
            uic,
          },
        };
      },
      transformResponse: (response: IBankTimeForecastDto) => mapBankTimeForecast(response),
      providesTags: [AutoDsrTagEnum.BANK_TIME_FORECAST],
    }),
  }),
});

export const { useGetBankTimeQuery } = bankTimeForecastApi;
