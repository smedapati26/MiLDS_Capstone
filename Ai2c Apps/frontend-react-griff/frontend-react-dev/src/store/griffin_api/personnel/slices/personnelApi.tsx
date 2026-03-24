import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { PERSONNEL_BASE_URL } from '@store/griffin_api/base_urls';

import {
  ICrewExperienceReadinessLevel,
  ICrewExperienceReadinessLevelArgs,
  ICrewExperienceReadinessLevelTransformedData,
  ICrewExperienceSkill,
  ICrewExperienceSkillArgs,
  ICrewStrengthArgs,
  ICrewStrengthMosRes,
  ICrewStrengthSkillRes,
} from '../models';

export const personnelApi = createApi({
  reducerPath: 'personnelApi',
  baseQuery: authFetchBaseQuery({ baseUrl: PERSONNEL_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    getCrewExperienceSkill: build.query<ICrewExperienceSkill[], ICrewExperienceSkillArgs>({
      query: ({ uic, models, skills }) => {
        const modified_params = new URLSearchParams();
        if (uic) modified_params.append('uic', uic);
        if (models) models.forEach((model: string) => modified_params.append('models', model));
        if (skills) skills.forEach((skill: string) => modified_params.append('skills', skill));
        return {
          url: `/crew-expr-skill`,
          params: modified_params,
        };
      },
      transformResponse: (response: ICrewExperienceSkill[]) => response,
    }),
    getCrewExperienceReadinessLevel: build.query<
      ICrewExperienceReadinessLevelTransformedData,
      ICrewExperienceReadinessLevelArgs
    >({
      query: ({ uic, models }) => {
        const modified_params = new URLSearchParams();
        if (uic) modified_params.append('uic', uic);
        if (models) models.forEach((model: string) => modified_params.append('models', model));
        return {
          url: `/crew-expr-rl`,
          params: modified_params,
        };
      },
      transformResponse: (response: ICrewExperienceReadinessLevel[]) => {
        // Initialize the result object with proper typing
        const result: ICrewExperienceReadinessLevelTransformedData = {};

        if (!response || !Array.isArray(response)) {
          return result;
        }

        response.forEach((item) => {
          const model = item.model;
          const readiness_level = item.readiness_level;
          const rl_type = item.rl_type;
          const count = typeof item.count === 'number' ? item.count : 0;

          // Create model object if it doesn't exist
          if (!result[model]) {
            result[model] = {};
          }

          // Create readiness level object if it doesn't exist
          if (!result[model][readiness_level]) {
            result[model][readiness_level] = {};
          }

          // Store the count for this rl_type
          result[model][readiness_level][rl_type] = count;
        });

        return result;
      },
    }),
    getPersonnelSkills: build.query<string[], { uic: string }>({
      query: ({ uic }) => {
        return {
          url: '/skills',
          params: { uic },
        };
      },
      transformResponse: (response: string[]) => response,
    }),
    getCrewStrengthSkills: build.query<ICrewStrengthSkillRes[], ICrewStrengthArgs>({
      query: ({ uic }) => {
        return {
          url: '/crew-strength-skill',
          params: { uic },
        };
      },
      transformResponse: (response: ICrewStrengthSkillRes[]) => response,
    }),
    getCrewStrengthMos: build.query<ICrewStrengthMosRes[], ICrewStrengthArgs>({
      query: ({ uic }) => {
        return {
          url: '/crew-strength-mos',
          params: { uic },
        };
      },
      transformResponse: (response: ICrewStrengthMosRes[]) => response,
    }),
  }),
});

export const {
  useGetCrewExperienceSkillQuery,
  useGetCrewExperienceReadinessLevelQuery,
  useGetPersonnelSkillsQuery,
  useGetCrewStrengthMosQuery,
  useGetCrewStrengthSkillsQuery,
} = personnelApi;
