import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';

import { PERSONNEL_BASE_URL } from '../../base_urls.ts';
import { PersonnelTagEnum } from '../cacheTags.ts';
import { IMaintainerDto } from '../models/IMaintainer.ts';
import { IPhaseTeamDto, IPhaseTeamPostDto, IPhaseTeamPutDto } from '../models/IPhaseTeam.ts';

// API Slice
export const phaseTeamApi = createApi({
  reducerPath: 'amapPhaseTeamApi',
  baseQuery: authFetchBaseQuery({ baseUrl: PERSONNEL_BASE_URL }),
  keepUnusedDataFor: 300,
  tagTypes: [PersonnelTagEnum.PHASE_TEAM],
  endpoints: (build) => ({
    getMaintainers: build.query<IMaintainerDto[], { uic: string; start_date: string; end_date: string }>({
      query: ({ uic, start_date, end_date }) => ({
        url: `/unit/phase-maintainers`,
        params: { uic, start_date, end_date },
      }),
    }),
    getPhaseTeam: build.query<IPhaseTeamDto, { phaseId: number | string }>({
      query: ({ phaseId }) => ({
        url: `/phase-team/${phaseId}`,
      }),
      providesTags: (_result, _err, { phaseId }) => [{ type: PersonnelTagEnum.PHASE_TEAM, id: phaseId }],
    }),
    addPhaseTeam: build.mutation<void, IPhaseTeamPostDto>({
      query: ({ phaseId, ...body }) => ({
        url: `/phase-team/${phaseId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _err, { phaseId }) => [{ type: PersonnelTagEnum.PHASE_TEAM, id: phaseId }],
    }),
    updatePhaseTeam: build.mutation<void, IPhaseTeamPutDto>({
      query: ({ phaseId, ...body }) => ({
        url: `/phase-team/${phaseId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _err, { phaseId }) => [{ type: PersonnelTagEnum.PHASE_TEAM, id: phaseId }],
    }),
  }),
});

// Hooks
export const { useGetMaintainersQuery, useGetPhaseTeamQuery, useAddPhaseTeamMutation, useUpdatePhaseTeamMutation } =
  phaseTeamApi;
