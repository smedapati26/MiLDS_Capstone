import z from 'zod';

import { step2Schema } from '@features/task-forces/components//create-stepper/step 2/schema';
import { step1Schema } from '@features/task-forces/components/create-stepper';

// Combined Schema
export const editUnitsSchema = z.object({
  uic: z.string(),
  ...step1Schema.shape,
  ...step2Schema.shape,
});

// Use schema to infer the Typescript type
export type EditUnitsSchemaType = z.infer<typeof editUnitsSchema>;
