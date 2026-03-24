import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { EQUIPMENT_BASE_URL } from '@store/griffin_api/base_urls';
import {
  IAircraftModelStatus,
  IAircraftModelStatusDto,
  mapToAircraftModelStatus,
} from '@store/griffin_api/equipment/models/IEquipment';

// API Slice
export const equipmentApi = createApi({
  reducerPath: 'equipmentApi',
  baseQuery: authFetchBaseQuery({ baseUrl: EQUIPMENT_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getAircraftModelStatus: builder.query<IAircraftModelStatus[], string>({
      query: (uic) => `aircraft-model-status?uic=${uic}`,
      transformResponse: (response: IAircraftModelStatusDto[]) => response.map(mapToAircraftModelStatus),
    }),
  }),
});

// Hooks
export const { useGetAircraftModelStatusQuery } = equipmentApi;
