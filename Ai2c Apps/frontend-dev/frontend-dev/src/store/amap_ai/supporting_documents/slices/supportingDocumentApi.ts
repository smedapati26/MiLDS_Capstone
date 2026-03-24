import { createApi } from '@reduxjs/toolkit/query/react';

import { authFetchBaseQuery } from '@store/authFetchBaseQuery';

import {
  ICreateSupportingDocumentOut,
  IUpdateSupportingDocumentOut,
  mapToSupportingDocument,
  SupportingDocument,
  SupportingDocumentDTO,
} from '../models';

export const supportingDocumentBaseUrl = `${import.meta.env.VITE_AMAP_API_URL}/v1/supporting_documents`;

export const supportingDocumentApiSlice = createApi({
  reducerPath: 'supportingDocumentsApi',
  baseQuery: authFetchBaseQuery({ baseUrl: supportingDocumentBaseUrl }),
  endpoints: (builder) => ({
    getSupportingDocuments: builder.query<
      { supportingDocuments: SupportingDocument[] },
      { soldier_id: string; visible_only: boolean }
    >({
      query: ({ soldier_id, visible_only }) => ({
        url: `/soldier/${soldier_id}`,
        params: { visible_only },
        method: 'GET',
      }),
      transformResponse: (response: SupportingDocumentDTO[]): { supportingDocuments: SupportingDocument[] } => {
        return {
          supportingDocuments: response.map((dto: SupportingDocumentDTO) => mapToSupportingDocument(dto)),
        };
      },
    }),
    getDocumentFileById: builder.query<File | null, { document_id: string }>({
      queryFn: async ({ document_id }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `/${document_id}`,
          method: 'GET',
          responseHandler: (response) => response.blob(),
        });

        if (result.error) {
          return { error: result.error };
        }

        const blobData = result.data as Blob;

        if (blobData.size !== 4) {
          return {
            data: new File([blobData], `Supporting Document ${document_id}.pdf`, {
              type: blobData.type,
            }),
          };
        }

        return { data: null };
      },
    }),
    updateSupportingDocument: builder.mutation<
      { message: string; success: boolean },
      { document_id: number; data: IUpdateSupportingDocumentOut }
    >({
      query: ({ document_id, data }) => {
        return {
          url: `/${document_id}`,
          method: 'PUT',
          body: data,
        };
      },
    }),
    createSupportingDocument: builder.mutation<
      { message: string },
      { soldier_id: string; data: ICreateSupportingDocumentOut; file: File }
    >({
      query: ({ soldier_id, data, file }) => {
        const formData = new FormData();

        formData.append('file', file);

        formData.append('document_title', data.document_title);
        formData.append('document_type', data.document_type);
        formData.append('document_date', data.document_date.toISOString().slice(0, 10));
        if (data.related_designation_id) {
          formData.append('related_designation_id', data.related_designation_id);
        }
        if (data.related_event_id) {
          formData.append('related_event_id', data.related_event_id);
        }

        return {
          url: `/soldier/${soldier_id}`,
          method: 'POST',
          body: formData,
        };
      },
    }),
    getAllDocumentTypes: builder.query<{ id: number; type: string }[], void>({
      query: () => ({
        url: `/types`,
        method: 'GET',
      }),
    }),
    deleteSupportinDocument: builder.mutation<{ message: string }, { id: number }>({
      query: ({ id }) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
    }),
    getCombinedDocumentsZip: builder.query<File | null, { da_4856_ids?: number[]; supporting_doc_ids?: number[] }>({
      queryFn: async ({ da_4856_ids, supporting_doc_ids }, _api, _extraOptions, baseQuery) => {
        const params = new URLSearchParams();

        if (da_4856_ids?.length) {
          params.append('da_4856_ids', da_4856_ids.join(','));
        }
        if (supporting_doc_ids?.length) {
          params.append('supporting_doc_ids', supporting_doc_ids.join(','));
        }

        const result = await baseQuery({
          url: `/combined_documents?${params.toString()}`,
          method: 'GET',
          responseHandler: (response) => response.blob(),
        });

        if (result.error) {
          return { error: result.error };
        }

        const blobData = result.data as Blob;

        if (blobData.size < 100) {
          return { data: null };
        }

        return {
          data: new File([blobData], `supporting_documents.zip`, {
            type: 'application/zip',
          }),
        };
      },
    }),
  }),
});

// Reducer
export const supportingDocumentApiReducer = supportingDocumentApiSlice.reducer;

// Hooks
export const {
  useGetSupportingDocumentsQuery,
  useGetAllDocumentTypesQuery,
  useGetDocumentFileByIdQuery,
  useLazyGetAllDocumentTypesQuery,
  useLazyGetDocumentFileByIdQuery,
  useLazyGetCombinedDocumentsZipQuery,
  useCreateSupportingDocumentMutation,
  useUpdateSupportingDocumentMutation,
  useLazyGetSupportingDocumentsQuery,
  useDeleteSupportinDocumentMutation,
} = supportingDocumentApiSlice;
