import z from 'zod';

import { dateRangeSchemaOptional, locationSchema } from '@models/react-hook-form';

// Validation schema
export const TaskForceFilterSchema = z.object({
  tfDateRange: dateRangeSchemaOptional,
  location: locationSchema.optional(),
});

// Use schema to infer the Typescript type
export type TaskForceFilterSchemaType = z.infer<typeof TaskForceFilterSchema>;

// Default Values
export const taskForceFilterDefaultValues: TaskForceFilterSchemaType = {
  tfDateRange: {
    startDate: undefined,
    endDate: undefined,
  },
  location: undefined,
};
