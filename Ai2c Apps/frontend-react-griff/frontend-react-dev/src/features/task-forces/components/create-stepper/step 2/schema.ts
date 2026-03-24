import z from 'zod';

export const equipmentSchema = z.object({
  serial: z.string().optional(),
  model: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  isAdmin: z.boolean().optional(),
});

// Subordinate validation schema
export const subordinateSchema = z.object({
  id: z.string(),
  uuid: z.string(),
  parentId: z.string(),
  level: z.number(),
  echelon: z.string().min(1, 'Echelon required'),
  name: z.string().min(1, 'Task force name is required'),
  ownerId: z.string().min(1, 'Owner required'),
  shortname: z.string().min(1, 'Short name required'),
  nickname: z.string().optional(),
  aircraft: z.array(equipmentSchema).optional(), // Array of Aircraft serial numbers
  uas: z.array(equipmentSchema).optional(), // Array of UAS serial numbers
  agse: z.array(equipmentSchema).optional(), // Array of AGSE serial numbers
});

// Default Values
export const subordinateDefaultValue = {
  id: '',
  uuid: '',
  parentId: '',
  level: 0,
  echelon: '',
  name: '',
  shortname: '',
  ownerId: '',
  nickname: '',
  aircraft: [],
  uas: [],
  agse: [],
};

// Validation schema
export const step2Schema = z.object({
  subordinates: z.array(subordinateSchema),
});

// Use schema to infer the Typescript type
export type Step2SchemaType = z.infer<typeof step2Schema>;
export type SubordinateSchemaType = z.infer<typeof subordinateSchema>;
export type EquipmentSchemaType = z.infer<typeof equipmentSchema>;

// Default Values
export const step2SchemaDefaultValues: Step2SchemaType = {
  subordinates: [],
};
