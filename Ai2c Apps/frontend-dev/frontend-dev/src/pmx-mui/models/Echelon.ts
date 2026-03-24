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
export const getEchelonOptions = (): Array<EnumOption> =>
  Object.entries(Echelon).map(
    ([label, value]): EnumOption => ({
      label: titlecase(label),
      value,
    }),
  );

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
  TM: { value: 'TM', label: 'Team', level: 10 },
  SQD: { value: 'SQD', label: 'Squad', level: 9 },
  SEC: { value: 'SEC', label: 'Section', level: 8.5 },
  DET: { value: 'DET', label: 'Detachment', level: 8 },
  PLT: { value: 'PLT', label: 'Platoon', level: 8 },
  CO: { value: 'CO', label: 'Company', level: 7 },
  ACT: { value: 'ACT', label: 'Activity', level: 6 },
  BN: { value: 'BN', label: 'Battalion', level: 6 },
  FACILITY: { value: 'FACILITY', label: 'Aviation Support Facility', level: 6 },
  BDE: { value: 'BDE', label: 'Brigade', level: 5 },
  DIR: { value: 'DIR', label: 'Directorate', level: 5 },
  GROUP: { value: 'GROUP', label: 'Group', level: 5 },
  AGENCY: { value: 'AGENCY', label: 'Agency', level: 4 },
  DIV: { value: 'DIV', label: 'Division', level: 4 },
  OFC: { value: 'OFC', label: 'Office', level: 4 },

  CORPS: { value: 'CORPS', label: 'Corps', level: 3 },
  STATE: { value: 'STATE', label: 'State Army National Guard', level: 3 },

  MACOM: { value: 'MACOM', label: 'Major Command', level: 2 },
  CNTR: { value: 'CNTR', label: 'Center', level: 2 },
  MSC: { value: 'MSC', label: 'Major Subordinate Command', level: 2 },

  ASCC: { value: 'ASCC', label: 'Army Service Component Command', level: 1 },
  ACOM: { value: 'ACOM', label: 'Army Command', level: 1 },
  DRU: { value: 'DRU', label: 'Direct Reporting Unit', level: 1 },
  HQ: { value: 'HQ', label: 'Headquarters', level: 1 },

  ARMY: { value: 'ARMY', label: 'Army', level: 0 },
  CONTAINER: { value: 'CONTAINER', label: 'Container for Organizing Units', level: 0 },
  UC: { value: 'UC', label: 'Unified Command', level: 0 },

  AUG: { value: 'AUG', label: 'Augmentation', level: null },
  ELEMT: { value: 'ELEMT', label: 'Element', level: null },
  FMS: { value: 'FMS', label: 'Field Maintenance Shop', level: null },
  INST: { value: 'INST', label: 'Institute', level: null },
  MILSVC: { value: 'MILSVC', label: 'Military Service', level: null },
  SCH: { value: 'SCH', label: 'School', level: null },
  TF: { value: 'TF', label: 'Task Force', level: null },
  UNK: { value: 'UNK', label: 'Unknown', level: null },
};
