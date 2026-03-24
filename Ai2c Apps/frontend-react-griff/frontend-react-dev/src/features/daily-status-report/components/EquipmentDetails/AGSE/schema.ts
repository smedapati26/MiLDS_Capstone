import z from 'zod';

// Validation schema
export const AgseFilterSchema = z.object({
  conditions: z.string().nullable(),
  serialNumbers: z.array(z.string()),
  models: z.array(z.string()),
  units: z.array(z.string()),
  location: z.array(z.string()),
});

// Use schema to infer the Typescript type
export type AgseFilterSchemaType = z.infer<typeof AgseFilterSchema>;

// Default Values
export const agseDefaultValues: AgseFilterSchemaType = {
  conditions: null,
  serialNumbers: [],
  models: [],
  units: [],
  location: [],
};
