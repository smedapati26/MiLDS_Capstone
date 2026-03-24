import z from 'zod';

// Validation schema
export const AircraftTransferFilterSchema = z.object({
  statuses: z.array(z.string()),
  models: z.array(z.string()),
});

// Use schema to infer the Typescript type
export type AircraftTransferFilterSchemaType = z.infer<typeof AircraftTransferFilterSchema>;

// Default Values
export const aircraftTransferDefaultValues: AircraftTransferFilterSchemaType = {
  statuses: [],
  models: [],
};
