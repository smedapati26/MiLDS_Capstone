import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';

import {
  ICreateSoldierFlagOut,
  ISoldierFlag,
  ISoldierFlagDTO,
  ISoldierPersonnelFlag,
  ISoldierPersonnelFlagDTO,
  ISoldierUnitFlag,
  ISoldierUnitFlagDTO,
  IUpdateSoldierFlagOut,
  mapToISoldierFlag,
  mapToISoldierPersonnelFlag,
  mapToISoldierUnitFlag,
} from '../models';

export const soldierFlagBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/soldier_flag`;

export const soldierFlagApiSlice = createApi({
  reducerPath: 'soldierFlagApi',
  baseQuery: authFetchBaseQuery({ baseUrl: soldierFlagBaseUrl }),
  endpoints: (builder) => ({
    getSoldierFlags: builder.query<
      { individualFlags: ISoldierFlag[]; unitFlags: ISoldierUnitFlag[]; unitFlagPersonnel: ISoldierPersonnelFlag[] },
      { soldier_id: string }
    >({
      query: () => ({
        url: `/soldier/ALL`,
        method: 'GET',
      }),
      transformResponse: (response: {
        individual_flags: ISoldierFlagDTO[];
        unit_flags: ISoldierUnitFlagDTO[];
        unit_flag_personnel: ISoldierPersonnelFlagDTO[];
      }): {
        individualFlags: ISoldierFlag[];
        unitFlags: ISoldierUnitFlag[];
        unitFlagPersonnel: ISoldierPersonnelFlag[];
      } => {
        return {
          individualFlags: response.individual_flags.map((dto: ISoldierFlagDTO) => mapToISoldierFlag(dto)),
          unitFlags: response.unit_flags.map((dto: ISoldierUnitFlagDTO) => mapToISoldierUnitFlag(dto)),
          unitFlagPersonnel: response.unit_flag_personnel.map((dto: ISoldierPersonnelFlagDTO) =>
            mapToISoldierPersonnelFlag(dto),
          ),
        };
      },
    }),
    addSoldierFlag: builder.mutation<{ message: string }, { creationData: ICreateSoldierFlagOut }>({
      query: ({ creationData }) => ({
        url: ``,
        method: 'POST',
        body: creationData,
      }),
    }),
    updateSoldierFlag: builder.mutation<
      { message: string },
      { soldier_flag_id: number; updateData: IUpdateSoldierFlagOut }
    >({
      query: ({ soldier_flag_id, updateData }) => ({
        url: `/${soldier_flag_id}`,
        method: 'PUT',
        body: updateData,
      }),
    }),
    deleteSoldierFlag: builder.mutation<{ message: string }, { soldier_flag_id: number }>({
      query: ({ soldier_flag_id }) => ({
        url: `/${soldier_flag_id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

// Reducer
export const soldierFlagApiReducer = soldierFlagApiSlice.reducer;

// Hooks
export const {
  useGetSoldierFlagsQuery,
  useAddSoldierFlagMutation,
  useUpdateSoldierFlagMutation,
  useDeleteSoldierFlagMutation,
} = soldierFlagApiSlice;
