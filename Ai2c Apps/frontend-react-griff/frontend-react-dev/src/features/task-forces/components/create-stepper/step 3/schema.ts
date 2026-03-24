import z from 'zod';

import { equipmentSchema } from '../step 2/schema';

// Validation schema
export const step3Schema = z.object({
  aircraft: z.array(equipmentSchema), // Array of aircraft serial numbers
});

// Use schema to infer the Typescript type
export type Step3SchemaType = z.infer<typeof step3Schema>;

// Default Values
export const step3SchemaDefaultValues = {
  aircraft: [],
};
