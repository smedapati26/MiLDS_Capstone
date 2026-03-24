import z from 'zod';

import { dateRangeSchema, locationSchema } from '@models/react-hook-form';

// Validation schema
export const step1Schema = z.object({
  name: z.string().min(1, 'Task force name is required'),
  echelon: z.string().min(1, 'Echelon required'),
  shortname: z.string().min(1, 'Short name required'),
  nickname: z.string().optional(),
  tfDateRange: dateRangeSchema.or(z.string().min(1, 'Date Range required')),
  location: locationSchema.required().or(z.string().min(1, 'Location required')),
  ownerId: z.string().min(1, 'Owner required'),
  slogan: z.string().optional(),
  logo: z.any().optional(),
});

// Use schema to infer the Typescript type
export type Step1SchemaType = z.infer<typeof step1Schema>;

// Default Values
export const step1SchemaDefaultValues: Step1SchemaType = {
  name: '',
  echelon: '',
  shortname: '',
  nickname: '',
  tfDateRange: {
    startDate: '',
    endDate: '',
  },
  location: '',
  ownerId: '',
  slogan: '',
  logo: '',
};
