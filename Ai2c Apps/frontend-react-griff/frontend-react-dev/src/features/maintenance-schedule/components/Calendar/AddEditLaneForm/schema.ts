import { z } from 'zod';

const UNIT_ERROR_MESSAGE = { message: 'Please select a Unit' };

export const schema = z.object({
  name: z.string().min(1, { message: 'Lane name is required' }),
  unit_id: z.string().min(5, UNIT_ERROR_MESSAGE).max(9, UNIT_ERROR_MESSAGE),
  airframes: z.array(z.string()),
  internal: z.string(),
  contractor: z.boolean(),
  location_id: z.number().nullable(),
});

export type AddEditLaneSchema = z.infer<typeof schema>;

export const defaultValues: AddEditLaneSchema = {
  name: '',
  unit_id: '',
  airframes: [],
  internal: 'internal',
  contractor: false,
  location_id: null,
};
