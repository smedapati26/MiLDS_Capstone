export interface ICrewStrengthArgs {
  uic: string;
  fiscal_year?: number;
  filter_enlisted?: boolean | null;
}

interface ICrewStrengthRes {
  rank: string;
  actual_count: number;
  num_authorized: number;
}

export interface ICrewStrengthSkillRes extends ICrewStrengthRes {
  skill: string;
}

export interface ICrewStrengthMosRes extends ICrewStrengthRes {
  mos: string;
}
