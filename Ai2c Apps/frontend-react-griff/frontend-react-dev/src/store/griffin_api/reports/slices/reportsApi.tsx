import { createApi } from '@reduxjs/toolkit/query/react';

import { handleUnzipCsvFiles } from '@utils/helpers/handleUnzipCsvFiles';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';
import { REPORTS_BASE_URL } from '@store/griffin_api/base_urls';

export type DsrExportConfig = {
  uic: string;
  pages?: string[];
  mods?: string[];
  insp?: string[];
  models?: string[];
  history_date?: string | null;
};

// API slice
export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: authFetchBaseQuery({ baseUrl: REPORTS_BASE_URL }),
  endpoints: (builder) => ({
    exportDsrPDF: builder.mutation({
      query: (payload: DsrExportConfig) => ({
        url: `/dsr/create/${payload.uic}`, // Get report by UIC
        method: 'POST',
        body: payload,
        responseHandler: (response) => response.blob(),
        cache: 'no-cache', // IMPORTANT
      }),
    }),
    exportDsrCSV: builder.query({
      query: (uic: string) => ({
        url: `/dsr/csv/${uic}`, // Get report by UIC
        method: 'GET',
        responseHandler: async (response) => {
          try {
            if (!response.ok) {
              throw new Error('Failed to download file');
            }
            const blob = await response.blob();
            const files = await handleUnzipCsvFiles(blob);
            return files; // Return the extracted file info
          } catch (error) {
            return error;
          }
        },
        cache: 'no-cache', // IMPORTANT
      }),
    }),
  }),
});

// Export the auto-generated hook
export const { useExportDsrPDFMutation, useLazyExportDsrCSVQuery } = reportsApi;
