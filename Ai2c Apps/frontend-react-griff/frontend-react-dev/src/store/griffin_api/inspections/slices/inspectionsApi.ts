import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { INSPECTIONS_BASE_URL } from '@store/griffin_api/base_urls';

import { IInspectionType, IInspectionTypeDto, mapToIInspectionType } from '../models';
import { IInspectionOption, IInspectionOptionDto, mapToIInspectionOption } from '../models/IInspectionOption';

// API Slice
export const inspectionsApi = createApi({
  reducerPath: 'inspectionsApi',
  baseQuery: authFetchBaseQuery({ baseUrl: INSPECTIONS_BASE_URL }),
  endpoints: (builder) => ({
    getInspectionTypes: builder.query<IInspectionType[], string>({
      // Accepts the aircraft model as parameter
      query: (model: string) => `/inspection-types?model=${model}`,
      transformResponse: (response: IInspectionTypeDto[]) => response.map(mapToIInspectionType),
    }),
    getInspectionOptionsForUnit: builder.query<IInspectionOption[], { uic: string; models?: string[] }>({
      // Accepts the unit uic as a parameter and models as an optional parameter
      query: ({ uic, models }) => {
        const params = new URLSearchParams();
        if (models && models.length > 0) {
          models.forEach((model) => params.append('models', model));
        }

        return {
          url: `/inspection-options/${uic}`,
          params: params,
        };
      },
      transformResponse: (response: IInspectionOptionDto[]) => response.map(mapToIInspectionOption),
    }),
  }),
});

// Hooks
export const { useGetInspectionTypesQuery, useGetInspectionOptionsForUnitQuery } = inspectionsApi;
