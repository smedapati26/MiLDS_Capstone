import z from 'zod';

// Validation schema
export const UACFilterSchema = z.object({
  status: z.string().nullable(),
  launchStatus: z.string().nullable(),
  packed: z.string().nullable(),
  serialNumbers: z.array(z.string()),
  models: z.array(z.string()),
  units: z.array(z.string()),
  location: z.array(z.string()),
});

// Use schema to infer the Typescript type
export type UACFilterSchemaType = z.infer<typeof UACFilterSchema>;

// Default Values
export const uacFilterDefaultValues: UACFilterSchemaType = {
  status: null,
  launchStatus: null,
  packed: null,
  serialNumbers: [],
  models: [],
  units: [],
  location: [],
};
