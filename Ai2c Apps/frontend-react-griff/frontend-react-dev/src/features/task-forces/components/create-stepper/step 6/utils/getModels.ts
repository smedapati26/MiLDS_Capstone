import { SubordinateSchemaType } from '../../step 2/schema';

/**
 * getModels
 *
 * Gets all models by by equipment type (aircraft, uas, agse)
 *
 * @returns Array<string>
 */
export const getModels = (row: SubordinateSchemaType | undefined): Array<string> => {
  let models: Array<string | null | undefined> = [];

  if (row && 'aircraft' in row && row.aircraft) {
    models = [...models, ...row.aircraft.map((aircraft) => aircraft.model)];
  }

  if (row && 'uas' in row && row.uas) {
    models = [...models, ...row.uas.map((uas) => uas.model)];
  }

  if (row && 'agse' in row && row.agse) {
    models = [...models, ...row.agse.map((agse) => agse.model)];
  }

  // De-dupe and return as string array
  return [...new Set(models)] as Array<string>;
};
