export enum MONTHS {
  January = 'JAN',
  February = 'FEB',
  March = 'MAR',
  April = 'APR',
  May = 'MAY',
  June = 'JUN',
  July = 'JUL',
  August = 'AUG',
  September = 'SEP',
  October = 'OCT',
  November = 'NOV',
  December = 'DEC',
  Unknown = 'UNK',
}

export enum SOLDIERFLAGTYPES {
  ADMIN = 'Administrative',
  UNITORPOS = 'Unit/Position',
  TASKING = 'Tasking',
  PROFILE = 'Profile',
  OTHER = 'Other',
}

export enum ADMINSOLDIERFLAGOPTIONS {
  LEAVE = 'Leave',
  TDY = 'TDY',
  FEVAL = 'Failed Evaluation',
  SFL = 'SFL TAP',
  CSP = 'CSP',
  ASAP = 'ASAP',
  PNA = 'Pending Negative Action',
  INVESTIGATION = 'Active Investigation',
  OTHER = 'Other',
}

export enum UNITPOSITIONSOLDIERFLAGOPTIONS {
  NON_MX_POS = 'Non-Maintenance Position',
  NON_MX_UNIT = 'Non-Maintenance Unit',
  BLOCK = 'Block Leave',
  OTHER = 'Other',
}

export enum TASKINGSOLDIERFLAGOPTIONS {
  INTERNAL = 'Internal',
  EXTERNAL = 'External',
}

export enum PROFILESOLDIERFLAGOPTIONS {
  TEMPORARY = 'Temporary',
  PERMANENT = 'Permanent',
}

export const ISoldierFlagOptionsMapping = {
  Administrative: ADMINSOLDIERFLAGOPTIONS,
  'Unit/Position': UNITPOSITIONSOLDIERFLAGOPTIONS,
  Tasking: TASKINGSOLDIERFLAGOPTIONS,
  Profile: PROFILESOLDIERFLAGOPTIONS,
  Other: [],
};

export const ISoldierFlagNonUnitFlagOptions = {
  ...ADMINSOLDIERFLAGOPTIONS,
  ...TASKINGSOLDIERFLAGOPTIONS,
  ...PROFILESOLDIERFLAGOPTIONS,
};

export enum MXAVAILABILITIES {
  AVAILABLE = 'Available',
  LIMITED = 'Limited',
  UNAVAILABLE = 'Unavailable',
}
