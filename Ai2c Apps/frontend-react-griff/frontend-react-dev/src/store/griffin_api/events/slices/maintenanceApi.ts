// Import the RTK Query methods from the React-specific entry point
import { createApi } from '@reduxjs/toolkit/query/react';

import { IPagedData } from '@models/IPagedData';
import { IUnitDateRange } from '@models/IUnitDateRange';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { AutoDsrTagEnum } from '@store/griffin_api/auto_dsr/cacheTags';
import { bankTimeForecastApi } from '@store/griffin_api/auto_dsr/slices/bankTimeForecastApi';
import { EVENTS_BASE_URL } from '@store/griffin_api/base_urls';
import { RootState } from '@store/store';

import { EventsTagEnum } from '../cacheTags';
import {
  IMaintenanceEventDto,
  IMaintenanceEventResponse,
  IUpcomingMaintenance,
  IUpcomingMaintenanceDto,
  MaintenanceEventPostDto,
  mapToIMaintenanceEvent,
  mapToIUpcomingMaintenance,
} from '../models/IMaintenanceEvent';

export interface UpdateMaintenancePayload {
  id: string | number;
  aircraft_id: string | null;
  lane_id: number | null;
  inspection_reference_id?: number | null;
  maintenance_type: string | null;
  event_start: string | null;
  event_end: string | null;
  notes?: string;
}

// API Slice
export const maintenanceApi = createApi({
  reducerPath: 'eventsMaintenanceApi',
  baseQuery: authFetchBaseQuery({ baseUrl: EVENTS_BASE_URL }),
  keepUnusedDataFor: 300,
  tagTypes: [EventsTagEnum.MAINTENANCE_EVENTS, AutoDsrTagEnum.BANK_TIME_FORECAST],
  endpoints: (builder) => ({
    getMaintenance: builder.query({
      query: (arg: IUnitDateRange) =>
        `/maintenance/?uic=${arg.uic}&begin_date=${arg.startDate}&end_date=${arg.endDate}`,
      transformResponse: (response: IPagedData<IMaintenanceEventDto>) => response.items.map(mapToIMaintenanceEvent),
      providesTags: [EventsTagEnum.MAINTENANCE_EVENTS],
    }),
    getMaintenanceEvent: builder.query({
      query: ({ eventId }: { eventId: string }) => `/maintenance/${eventId}`,
      transformResponse: (response: IMaintenanceEventDto) => mapToIMaintenanceEvent(response),
    }),
    getUpcomingMaintenance: builder.query<
      IUpcomingMaintenance[],
      { uic?: string; other_uics?: string[]; event_end: string; is_phase?: boolean; serial?: string }
    >({
      query: ({ uic, other_uics, event_end, is_phase, serial }) => {
        const params: { uic?: string; other_uics?: string[]; event_end?: string; is_phase?: boolean; serial?: string } =
          {
            uic,
          };
        if (is_phase) {
          params.is_phase = is_phase;
        }
        if (other_uics?.length) {
          params.other_uics = other_uics;
        }
        if (serial) {
          params.serial = serial;
        }
        if (event_end) {
          params.event_end = event_end;
        }
        if (is_phase) {
          params.is_phase = is_phase;
        }
        return {
          url: '/upcoming-maintenance',
          params,
        };
      },
      transformResponse: (response: IUpcomingMaintenanceDto[]) => response.map(mapToIUpcomingMaintenance),
      providesTags: [EventsTagEnum.MAINTENANCE_EVENTS],
    }),
    addMaintenanceEvent: builder.mutation<IMaintenanceEventResponse, MaintenanceEventPostDto>({
      query: (maintenanceEvent) => ({
        url: '/maintenance/',
        method: 'POST',
        body: maintenanceEvent,
      }),
      onQueryStarted: (_arg, api) => {
        api.queryFulfilled.then(() => {
          api.dispatch(bankTimeForecastApi.util.invalidateTags([AutoDsrTagEnum.BANK_TIME_FORECAST]));
        });
      },
      invalidatesTags: [EventsTagEnum.MAINTENANCE_EVENTS],
    }),
    updateMaintenanceEvent: builder.mutation<void, UpdateMaintenancePayload>({
      query: ({ id, ...body }) => ({
        url: `/maintenance/${id}`,
        method: 'PUT',
        body,
      }),
      onQueryStarted: (_arg, api) => {
        api.queryFulfilled.then(() => {
          api.dispatch(bankTimeForecastApi.util.invalidateTags([AutoDsrTagEnum.BANK_TIME_FORECAST]));
        });
      },
      invalidatesTags: [EventsTagEnum.MAINTENANCE_EVENTS],
    }),
    deleteMaintenanceEvent: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `/maintenance/${id}`,
        method: 'DELETE',
      }),
      onQueryStarted: (_arg, api) => {
        api.queryFulfilled.then(() => {
          api.dispatch(bankTimeForecastApi.util.invalidateTags([AutoDsrTagEnum.BANK_TIME_FORECAST]));
        });
      },
      invalidatesTags: [EventsTagEnum.MAINTENANCE_EVENTS],
    }),
  }),
});

// Selectors
export const selectMaintenance = (state: RootState) => state.eventsMaintenanceApi;

// Hooks
export const {
  useGetMaintenanceQuery,
  useGetMaintenanceEventQuery,
  useGetUpcomingMaintenanceQuery,
  useAddMaintenanceEventMutation,
  useUpdateMaintenanceEventMutation,
  useDeleteMaintenanceEventMutation,
} = maintenanceApi;
