import z from 'zod';

// Validation schema
export const AircraftFilterSchema = z.object({
  launchStatus: z.string().nullable(),
  orStatus: z.string().nullable(),
  serialNumbers: z.array(z.string()),
  models: z.array(z.string()),
  units: z.array(z.string()),
  location: z.array(z.string()),
  modifications: z.array(z.string()),
  isHoursFlownChecked: z.boolean(),
  hoursFlown: z.tuple([z.number(), z.number()]),
  isHoursToPhaseChecked: z.boolean(),
  hoursToPhase: z.tuple([z.number(), z.number()]),
});

// Use schema to infer the Typescript type
export type AircraftFilterSchemaType = z.infer<typeof AircraftFilterSchema>;

// Default Values
export const aircraftDefaultValues: AircraftFilterSchemaType = {
  launchStatus: null,
  orStatus: null,
  serialNumbers: [],
  models: [],
  units: [],
  location: [],
  modifications: [],
  isHoursFlownChecked: false,
  hoursFlown: [0, 0],
  isHoursToPhaseChecked: false,
  hoursToPhase: [0, 0],
};
