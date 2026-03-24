import { z } from 'zod';

// Location validation objects
export const locationSchema = z.object({
  name: z.string().min(1, 'Name required').default(''),
  code: z.string().min(1, 'Code required').default(''),
  id: z.number().min(1, 'Required').default(-1),
});

/** Location schema type */
export type LocationSchemaType = z.infer<typeof locationSchema>;
