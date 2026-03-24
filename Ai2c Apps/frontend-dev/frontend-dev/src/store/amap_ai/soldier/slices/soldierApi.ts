import { createApi } from '@reduxjs/toolkit/query/react';

import { ISoldier, ISoldierDTO, IUpdateSoldierOut } from '@store/amap_ai/soldier/models';
import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { mapResponseData } from '@utils/helpers/dataTransformer';

export const soldierApiBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/soldier`;

export const soldierApiSlice = createApi({
  reducerPath: 'soldierApi',
  baseQuery: authFetchBaseQuery({ baseUrl: soldierApiBaseUrl }),
  endpoints: (builder) => ({
    getUnitSoldiers: builder.query<
      { soldiers: ISoldier[]; unit: { uic: string; name: string } },
      { uic: string; type: 'all_soldiers' | 'all_maintainers' | 'amtp_maintainers' | 'amtp_maintainers_short' }
    >({
      query: ({ uic, type }) => ({
        url: `/unit/${uic}/${type}`,
        method: 'GET',
      }),
      transformResponse: (response: { soldiers: ISoldierDTO[]; unit: { uic: string; name: string } }) =>
        mapResponseData(response),
    }),
    updateSoldier: builder.mutation<ISoldier, IUpdateSoldierOut>({
      query: (data) => {
        const { user_id, ...bodyData } = data;
        return {
          url: `/${user_id}`,
          method: 'PATCH',
          body: bodyData,
        };
      },
      transformResponse: (response: ISoldierDTO) => mapResponseData(response),
    }),
  }),
});

// Reducer
export const soldierApiReducer = soldierApiSlice.reducer;

// Hooks
export const { useGetUnitSoldiersQuery, useLazyGetUnitSoldiersQuery, useUpdateSoldierMutation } = soldierApiSlice;
