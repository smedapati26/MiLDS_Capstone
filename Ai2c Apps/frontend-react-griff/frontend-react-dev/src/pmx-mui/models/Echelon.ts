import { titlecase } from '../helpers';
import { EnumOption } from './EnumOption';

export enum Echelon {
  ACTIVITY = 'ACT',
  AGENCY = 'AGENCY',
  ARMY = 'ARMY',
  ARMY_COMMAND = 'ACOM',
  ARMY_SERVICE_COMPONENT_COMMAND = 'ASCC',
  AUGMENTATION = 'AUG',
  BATTALION = 'BN',
  BRIGADE = 'BDE',
  CENTER = 'CNTR',
  COMPANY = 'CO',
  CONTAINER = 'CONTAINER',
  CORPS = 'CORPS',
  DEPARTMENT = 'MILSVC',
  DETACHMENT = 'DET',
  DIRECT_REPORTING_UNIT = 'DRU',
  DIRECTORATE = 'DIR',
  DIVISION = 'DIV',
  ELEMENT = 'ELEMT',
  FACILITY = 'FACILITY',
  FIELD_MAINTENANCE_SHOP = 'FMS',
  GROUP = 'GROUP',
  HEADQUARTERS = 'HQ',
  INSTITUTE = 'INST',
  MAJOR_COMMAND = 'MACOM',
  MAJOR_SUBORDINATE_COMMAND = 'MSC',
  OFFICE = 'OFC',
  PLATOON = 'PLT',
  SCHOOL = 'SCH',
  SECTION = 'SEC',
  SQUAD = 'SQD',
  STATE_GUARD = 'STATE',
  TASK_FORCE = 'TF',
  TEAM = 'TM',
  UNKNOWN = 'UNK',
  UNIFIED_COMMAND = 'UC',
}

/**
 * getEchelonName
 * Returns
 * @param { string } echelon - Enum key
 */
export function getEchelonName(echelon: string) {
  return titlecase(Object.entries(Echelon).filter(([_key, value]) => value == echelon)[0][0]);
}

/**
 * Get Echelon options
 *
 * @returns { Array<EnumOption> } Array of EnumOption's
 */
export const getEchelonOptions = (level: number | null | 'all' = 'all'): Array<EnumOption> => {
  if (level !== 'all') {
    return Object.entries(EchelonMap)
      .filter(([_key, { level: echelonLevel }]) => !echelonLevel || !level || echelonLevel >= level)
      .map(
        ([key, { label, value }]): EnumOption => ({
          key: key,
          label: titlecase(label),
          value: value,
        }),
      );
  }

  return Object.entries(EchelonMap).map(
    ([key, { label, value }]): EnumOption => ({
      key: key,
      label: titlecase(label),
      value: value,
    }),
  );
};

export type EchelonMapping = {
  label: string;
  value: string;
  level: number | null;
};

/**
 * Echelon Mapping
 *
 * @example:
 * const echelon = EchelonMap["CO"]
 * console.log(echelon) => { value: 'CO', label: 'Company', level: 7 }
 */
export const EchelonMap: { [key: string]: EchelonMapping } = {
  BDE: { value: 'BDE', label: 'Brigade', level: 1 },
  BN: { value: 'BN', label: 'Battalion', level: 2 },
  CO: { value: 'CO', label: 'Company', level: 3 },
  PLT: { value: 'PLT', label: 'Platoon', level: 4 },
  SQD: { value: 'SQD', label: 'Squad', level: 5 },
  TM: { value: 'TM', label: 'Team', level: 6 },
};
