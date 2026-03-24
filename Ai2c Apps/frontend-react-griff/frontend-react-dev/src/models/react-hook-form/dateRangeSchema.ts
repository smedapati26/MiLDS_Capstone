import dayjs from 'dayjs';
import { z } from 'zod';

export const dateRangeSchemaOptional = z
  .object({
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
  })
  .refine(
    (data) => (!data.endDate || data.endDate === '' ? true : dayjs(data.endDate).isAfter(dayjs(data.startDate))),
    {
      path: ['startDate'],
      message: 'Start date must be before end date',
    },
  )
  .refine(
    (data) => (!data.startDate || data.startDate === '' ? true : dayjs(data.startDate).isBefore(dayjs(data.endDate))),
    {
      path: ['endDate'],
      message: 'End date must be after start date',
    },
  )
  .optional()
  .nullable();

/**
 * Represents Date Range
 */
export const dateRangeSchema = z
  .object(
    {
      startDate: z.string(),
      endDate: z.string(),
    },
    {
      required_error: 'Please select a date range',
    },
  )
  .refine((data) => (data.endDate === '' ? true : dayjs(data.endDate).isAfter(dayjs(data.startDate))), {
    path: ['startDate'],
    message: 'Start date must be before end date',
  })
  .refine((data) => (data.startDate === '' ? true : dayjs(data.startDate).isBefore(dayjs(data.endDate))), {
    path: ['endDate'],
    message: 'End date must be after start date',
  });

/** Date range schema type */
export type DateRangeSchemaType = z.infer<typeof dateRangeSchema>;
