import { EquipmentSchemaType } from '../components/create-stepper/step 2/schema';

// Maps equipment serial numbers into string array
export const getSerialNumbers = (data: Array<EquipmentSchemaType> | undefined): Array<string> => {
  return data ? (data.map((equipment) => equipment.serial) as Array<string>) : [];
};
