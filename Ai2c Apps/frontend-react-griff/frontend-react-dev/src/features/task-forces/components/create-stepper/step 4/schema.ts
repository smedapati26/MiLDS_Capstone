import z from 'zod';

import { equipmentSchema } from '../step 2/schema';

// Validation schema
export const step4Schema = z.object({
  uas: z.array(equipmentSchema), // Array of aircraft serial numbers
});

// Use schema to infer the Typescript type
export type Step4SchemaType = z.infer<typeof step4Schema>;

// Default Values
export const step4SchemaDefaultValues = {
  uas: [],
};
