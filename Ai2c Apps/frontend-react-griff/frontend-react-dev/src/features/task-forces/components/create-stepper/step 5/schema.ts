import z from 'zod';

import { equipmentSchema } from '../step 2/schema';

// Validation schema
export const step5Schema = z.object({
  agse: z.array(equipmentSchema), // Array of aircraft serial numbers
});

// Use schema to infer the Typescript type
export type Step5SchemaType = z.infer<typeof step5Schema>;

// Default Values
export const step5SchemaDefaultValues = {
  agse: [],
};
