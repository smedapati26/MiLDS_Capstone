import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';

import { PERSONNEL_UNIT_BASE_URL } from '../../base_urls';
import { IMaintainerExperienceMos, IMaintainerStrengthMosAvailability } from '../models/IMaintainerExperience';

// Helper function to create traces for a single MOS item
const createTracesForMos = (
  item: IMaintainerExperienceMos,
): { dates: string[]; traces: Partial<import('plotly.js').PlotData>[] } => {
  const dates = item.data.map((d) => d.date);

  const readinessLevels = new Set<string>();
  item.data.forEach((d) => {
    d.counts.forEach((c) => readinessLevels.add(c.level));
  });

  const traces: Partial<import('plotly.js').PlotData>[] = [];

  readinessLevels.forEach((level) => {
    const yValues = item.data.map((d) => {
      const countItem = d.counts.find((c) => c.level === level);
      return countItem && typeof countItem.count === 'number' ? countItem.count : 0;
    });
    traces.push({
      x: dates,
      y: yValues,
      type: 'bar',
      name: level,
      width: 0.25,
      stackgroup: 'one',
    });
  });

  return { dates, traces };
};

/* Base URL */

// API Slice
export const personnelByUnitApi = createApi({
  reducerPath: 'amapPersonnelUnitApi',
  baseQuery: authFetchBaseQuery({ baseUrl: PERSONNEL_UNIT_BASE_URL }),
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    getMaintainerExperienceMos: build.query<
      Record<string, { dates: string[]; traces: Partial<import('plotly.js').PlotData>[] }>,
      { uic: string; MOSs?: string[] }
    >({
      query: ({ uic, MOSs = [] }) => {
        const params = new URLSearchParams();
        params.append('uic', uic);
        MOSs.forEach((mos) => params.append('MOSs', mos));
        return {
          url: `/maintainer_experience_by_mos`,
          params,
        };
      },
      transformResponse: (response: IMaintainerExperienceMos[]) => {
        if (!response || !Array.isArray(response)) {
          return {};
        }

        const result: Record<string, { dates: string[]; traces: Partial<import('plotly.js').PlotData>[] }> = {};

        for (const item of response) {
          result[item.mos] = createTracesForMos(item);
        }

        return result;
      },
    }),
    getMaintainerStrengthMos: build.query<IMaintainerStrengthMosAvailability[], { uic: string; ranks?: string[] }>({
      query: ({ uic, ranks = [] }) => {
        const params = new URLSearchParams();
        params.append('uic', uic);
        ranks.forEach((rank) => params.append('ranks', rank));
        return {
          url: '/strength_by_mos',
          params,
        };
      },
      transformResponse: (response: IMaintainerStrengthMosAvailability[]) => response,
    }),
  }),
});

// Hooks
export const { useGetMaintainerExperienceMosQuery, useGetMaintainerStrengthMosQuery } = personnelByUnitApi;
