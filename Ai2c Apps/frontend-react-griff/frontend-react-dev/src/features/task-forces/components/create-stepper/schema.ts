import z from 'zod';

import { step1Schema, step1SchemaDefaultValues } from './step 1/schema';
import { step2Schema, step2SchemaDefaultValues } from './step 2/schema';
import { step3Schema, step3SchemaDefaultValues } from './step 3/schema';
import { step4Schema, step4SchemaDefaultValues } from './step 4/schema';
import { step5Schema, step5SchemaDefaultValues } from './step 5/schema';

// Combined Schema
export const createTaskForceSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
  ...step5Schema.shape,
});

// Use schema to infer the Typescript type
export type CreateTaskForceSchemaType = z.infer<typeof createTaskForceSchema>;

// Combined Default Values
export const createTaskForceDefaultValues: CreateTaskForceSchemaType = {
  ...step1SchemaDefaultValues,
  ...step2SchemaDefaultValues,
  ...step3SchemaDefaultValues,
  ...step4SchemaDefaultValues,
  ...step5SchemaDefaultValues,
};
