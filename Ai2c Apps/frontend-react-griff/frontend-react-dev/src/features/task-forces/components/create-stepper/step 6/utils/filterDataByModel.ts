import { EquipmentSchemaType, SubordinateSchemaType } from '../../step 2/schema';

/**
 * filterDataByModel
 *
 * Filters table row data by model and equipment type (aircraft, uas, agse)
 */
export const filterDataByModel = (
  row: SubordinateSchemaType,
  model: string,
): { type: string; data: Array<EquipmentSchemaType> } => {
  let type = 'None';
  let data: EquipmentSchemaType[] = [];

  if (row && 'aircraft' in row && row.aircraft) {
    type = 'Aircraft';
    data = [...data, ...row.aircraft.filter((aircraft) => aircraft.model === model)];
  }

  if (row && 'uas' in row && row.uas) {
    type = 'UAS';
    data = [...data, ...row.uas.filter((uas) => uas.model === model)];
  }

  if (row && 'agse' in row && row.agse) {
    type = 'AGSE';
    data = [...data, ...row.agse.filter((agse) => agse.model === model)];
  }

  return { type, data };
};
