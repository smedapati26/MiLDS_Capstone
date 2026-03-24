import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { createQueryString } from '@utils/helpers';

import { ICTLResponse, ICtls, ICtlsDto, mapToICtls } from '../models';

export type Packets = {
  ictls: boolean;
  uctls: boolean;
  maintainerRecord: boolean;
  counseling: boolean;
  supportingDocs: boolean;
};

export const readinessApiBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/readiness`;

export const readinessApiSlice = createApi({
  reducerPath: 'amtpPacketApi',
  baseQuery: authFetchBaseQuery({ baseUrl: readinessApiBaseUrl }),
  endpoints: (builder) => ({
    downloadPacket: builder.mutation({
      queryFn: async (
        {
          soldier_ids,
          packets,
        }: {
          soldier_ids: string[];
          packets: Packets;
        },
        _api,
        _extraOptions,
        baseQuery,
      ) => {
        const queryString = createQueryString({
          soldier_ids,
          ...(packets.ictls && { include_ictl: true }),
          ...(packets.uctls && { include_uctl: true }),
          ...(packets.maintainerRecord && { include_da_7817: true }),
          ...(packets.counseling && { include_da_4856: true }),
          ...(packets.supportingDocs && { include_supporting_documents: true }),
        });

        const result = await baseQuery({
          url: `/amap-packet?${queryString}`,
          method: 'GET',
          responseHandler: (response) => response.blob(),
        });

        if (result.error) {
          return { error: result.error };
        }

        const url = window.URL.createObjectURL(result.data as Blob);
        const hiddenElement = document.createElement('a');
        hiddenElement.href = url;
        hiddenElement.target = '_blank';
        hiddenElement.download = 'AMTP_Digital_Packet.zip';
        hiddenElement.click();
        window.URL.revokeObjectURL(url);

        return { data: null };
      },
    }),
    getCtls: builder.query<{ ictl: ICtls[]; uctl: ICtls[] }, { user_id: string }>({
      query: ({ user_id }) => ({
        url: `/${user_id}/ctls`,
        method: 'GET',
      }),
      transformResponse: (response: ICTLResponse): { ictl: ICtls[]; uctl: ICtls[] } => {
        return {
          ictl: response.soldier_ictl.map((dto: ICtlsDto) => mapToICtls(dto)),
          uctl: response.soldier_uctl.map((dto: ICtlsDto) => mapToICtls(dto)),
        };
      },
    }),
  }),
});

// Reducer
export const amtpPacketApiReducer = readinessApiSlice.reducer;

// Hooks
export const { useGetCtlsQuery, useLazyGetCtlsQuery, useDownloadPacketMutation } = readinessApiSlice;
