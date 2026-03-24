import z from 'zod';

import { step2Schema } from '../../create-stepper/step 2/schema';
import { step3Schema } from '../../create-stepper/step 3/schema';
import { step4Schema } from '../../create-stepper/step 4/schema';
import { step5Schema } from '../../create-stepper/step 5/schema';

// Combined Schema
export const editEquipmentSchema = z.object({
  uic: z.string(),
  name: z.string(),
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
  ...step5Schema.shape,
});

// Use schema to infer the Typescript type
export type EditEquipmentSchemaType = z.infer<typeof editEquipmentSchema>;
