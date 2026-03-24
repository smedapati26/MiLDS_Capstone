import z from 'zod';

// Validation schema
export const UAVFilterSchema = z.object({
  status: z.string().nullable(),
  launchStatus: z.string().nullable(),
  packed: z.string().nullable(),
  serialNumbers: z.array(z.string()),
  models: z.array(z.string()),
  units: z.array(z.string()),
  location: z.array(z.string()),
  // Hours Flown
  isHoursFlownChecked: z.boolean(),
  hoursFlown: z.tuple([z.number(), z.number()]),
  // Hours to Airframe
  isTotalAirframeHoursChecked: z.boolean(),
  totalAirframeHours: z.tuple([z.number(), z.number()]),
});

// Use schema to infer the Typescript type
export type UAVFilterSchemaType = z.infer<typeof UAVFilterSchema>;

// Default Values
export const uavFilterDefaultValues: UAVFilterSchemaType = {
  status: null,
  launchStatus: null,
  packed: null,
  serialNumbers: [],
  models: [],
  units: [],
  location: [],
  isHoursFlownChecked: false,
  hoursFlown: [0, 0],
  isTotalAirframeHoursChecked: false,
  totalAirframeHours: [0, 0],
};
