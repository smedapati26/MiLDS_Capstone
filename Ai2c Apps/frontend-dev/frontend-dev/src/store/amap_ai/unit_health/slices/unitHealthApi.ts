import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';

import {
  IEventReportFiltersOut,
  IEventReportSoldier,
  IEventReportSoldierDTO,
  IIndividualTask,
  IIndividualTaskDTO,
  ITaskReportFilterOut,
  ITaskReportSoldier,
  ITaskReportSoldierDTO,
  IUnitAvailabilityData,
  IUnitAvailabilityDataDTO,
  IUnitEvaluationsSoldierData,
  IUnitEvaluationsSoldierDataDTO,
  IUnitHealthData,
  IUnitHealthDataDTO,
  IUnitMissingPacketsSoldierData,
  IUnitMissingPacketsSoldierDataDTO,
  IUnitMOSMLReport,
  IUnitMOSMLReportDTO,
  IUnitRoster,
  IUnitRosterDTO,
  IUnitTask,
  IUnitTaskDTO,
  mapToIEventReportSoldier,
  mapToIIndividualTask,
  mapToITaskReportSoldier,
  mapToIUnitAvailabilityData,
  mapToIUnitEvaluationsSoldierData,
  mapToIUnitHealthData,
  mapToIUnitMissingPacketsSoldierData,
  mapToIUnitMOSMLReport,
  mapToIUnitRoster,
  mapToIUnitTask,
} from '../models';

export const unitHealthApiBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/unit_health`;

export const unitHealthApiSlice = createApi({
  reducerPath: 'unitHealthDataApi',
  baseQuery: authFetchBaseQuery({ baseUrl: unitHealthApiBaseUrl }),
  endpoints: (builder) => ({
    getUnitHealthData: builder.query<IUnitHealthData, { unit_uic: string; as_of_date: string }>({
      query: ({ unit_uic, as_of_date }) => ({
        url: `unit/${unit_uic}/health_summary`,
        params: { as_of_date },
        method: 'GET',
      }),
      transformResponse: (response: IUnitHealthDataDTO): IUnitHealthData => {
        return mapToIUnitHealthData(response);
      },
    }),
    getUnitAvailabilityData: builder.query<IUnitAvailabilityData[], { unit_uic: string; as_of_date: string }>({
      query: ({ unit_uic, as_of_date }) => ({
        url: `unit/${unit_uic}/availability_details`,
        params: { as_of_date },
        method: 'GET',
      }),
      transformResponse: (response: IUnitAvailabilityDataDTO[]): IUnitAvailabilityData[] => {
        return response.map(mapToIUnitAvailabilityData);
      },
    }),
    getUnitEvaluationsData: builder.query<IUnitEvaluationsSoldierData[], { unit_uic: string; as_of_date: string }>({
      query: ({ unit_uic, as_of_date }) => ({
        url: `unit/${unit_uic}/evaluation_details`,
        params: { as_of_date },
        method: 'GET',
      }),
      transformResponse: (response: IUnitEvaluationsSoldierDataDTO[]): IUnitEvaluationsSoldierData[] => {
        return response.map(mapToIUnitEvaluationsSoldierData);
      },
    }),
    getUnitMissingPacketsData: builder.query<
      IUnitMissingPacketsSoldierData[],
      { unit_uic: string; as_of_date: string }
    >({
      query: ({ unit_uic, as_of_date }) => ({
        url: `unit/${unit_uic}/missing_packets`,
        params: { as_of_date },
        method: 'GET',
      }),
      transformResponse: (response: IUnitMissingPacketsSoldierDataDTO[]): IUnitMissingPacketsSoldierData[] => {
        return response.map(mapToIUnitMissingPacketsSoldierData);
      },
    }),
    getUnitRosterData: builder.query<IUnitRoster[], { unit_uic: string; as_of_date: string }>({
      query: ({ unit_uic, as_of_date }) => ({
        url: `unit/${unit_uic}/health_roster`,
        params: { as_of_date },
        method: 'GET',
      }),
      transformResponse: (response: IUnitRosterDTO[]): IUnitRoster[] => {
        return response.map(mapToIUnitRoster);
      },
    }),
    getUnitMOSMLReport: builder.query<IUnitMOSMLReport, { unit_uic: string; mos: boolean; ml: boolean }>({
      query: ({ unit_uic, mos, ml }) => ({
        url: `unit/${unit_uic}/mos_ml_report`,
        params: { mos, ml },
        method: 'GET',
      }),
      transformResponse: (response: IUnitMOSMLReportDTO): IUnitMOSMLReport => {
        return mapToIUnitMOSMLReport(response);
      },
    }),
    getUnitEventsReport: builder.mutation<IEventReportSoldier[], IEventReportFiltersOut>({
      query: (filterData) => ({
        url: `unit/${filterData.unit_uic}/event_report`,
        method: 'POST',
        body: filterData,
      }),
      transformResponse: (response: IEventReportSoldierDTO[]): IEventReportSoldier[] => {
        return response.map(mapToIEventReportSoldier);
      },
    }),
    getUnitTasks: builder.query<{ unitTasks: IUnitTask[]; individualTasks: IIndividualTask[] }, { unit_uic: string }>({
      query: ({ unit_uic }) => ({
        url: `unit/${unit_uic}/searchable_tasks`,
        method: 'GET',
      }),
      transformResponse: (response: {
        unit_tasks: IUnitTaskDTO[];
        individual_tasks: IIndividualTaskDTO[];
      }): { unitTasks: IUnitTask[]; individualTasks: IIndividualTask[] } => {
        return {
          unitTasks: response.unit_tasks.map(mapToIUnitTask),
          individualTasks: response.individual_tasks.map(mapToIIndividualTask),
        };
      },
    }),
    getUnitTasksReport: builder.mutation<ITaskReportSoldier[], ITaskReportFilterOut>({
      query: (filterData) => ({
        url: `unit/${filterData.unit_uic}/task_report`,
        method: 'POST',
        body: filterData,
      }),
      transformResponse: (response: ITaskReportSoldierDTO[]): ITaskReportSoldier[] => {
        return response.map(mapToITaskReportSoldier);
      },
    }),
  }),
});

// Reducer
export const unitHealthApiReducer = unitHealthApiSlice.reducer;

// Hooks
export const {
  useGetUnitHealthDataQuery,
  useLazyGetUnitHealthDataQuery,
  useGetUnitAvailabilityDataQuery,
  useGetUnitEvaluationsDataQuery,
  useGetUnitMissingPacketsDataQuery,
  useGetUnitRosterDataQuery,
  useLazyGetUnitRosterDataQuery,
  useGetUnitMOSMLReportQuery,
  useLazyGetUnitMOSMLReportQuery,
  useGetUnitEventsReportMutation,
  useLazyGetUnitTasksQuery,
  useGetUnitTasksReportMutation,
} = unitHealthApiSlice;
