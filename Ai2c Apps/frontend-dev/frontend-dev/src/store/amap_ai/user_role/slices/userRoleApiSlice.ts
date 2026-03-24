import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';

export const userRoleBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/user_role`;

export const userRoleApiSlice = createApi({
  reducerPath: 'userRoleApi',
  baseQuery: authFetchBaseQuery({
    baseUrl: userRoleBaseUrl,
  }),
  endpoints: (builder) => ({
    createSoldierRole: builder.mutation<
      { message: string; success: boolean },
      { soldier_id: string | number; unit_uic: string; role: string }
    >({
      query: (data) => {
        return {
          url: ``,
          method: 'POST',
          body: data,
        };
      },
    }),
    updateSoldierRole: builder.mutation<
      { message: string; success: boolean },
      { roleId: number; creationData: { role?: string; designation?: string } }
    >({
      query: (data) => {
        return {
          url: `${data.roleId}`,
          method: 'PATCH',
          body: data.creationData,
        };
      },
    }),
    deleteSoldierRole: builder.mutation<{ message: string; success: boolean }, number>({
      query: (roleId) => {
        return {
          url: `${roleId}`,
          method: 'DELETE',
        };
      },
    }),
  }),
});

// Reducer
export const userRoleApiSliceReducer = userRoleApiSlice.reducer;

// Hooks
export const { useCreateSoldierRoleMutation, useUpdateSoldierRoleMutation, useDeleteSoldierRoleMutation } =
  userRoleApiSlice;
