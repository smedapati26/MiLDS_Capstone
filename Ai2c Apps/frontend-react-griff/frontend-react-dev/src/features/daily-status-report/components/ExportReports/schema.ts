import z from 'zod';

import { EXPORT_TYPE } from '@store/griffin_api/reports/models/ExportTypeEnum';

// Validation schema
export const ExportReportsSchema = z.object({
  type: z.string().min(1), // PDF = HTML API & CVS = CVS API
  unit: z.string().nullable(),
  models: z.array(z.string()),
  modifications: z.array(z.string()),
  inspections: z.array(z.string()),
  asOfDate: z.string().nullable(),
  pages: z.array(z.string()),
});

// Use schema to infer the Typescript type
export type ExportReportsSchemaType = z.infer<typeof ExportReportsSchema>;

// Default Values
export const exportReportDefaultValues: ExportReportsSchemaType = {
  type: EXPORT_TYPE.PDF,
  unit: null,
  models: [],
  modifications: [],
  inspections: [],
  asOfDate: null,
  pages: [],
};
