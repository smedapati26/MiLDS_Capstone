export interface ISkillCount {
  skill: string;
  count: number;
}

export interface IMaintainerExperienceMosCount {
  level: string;
  count: number;
}

export interface IMaintainerExperienceMosData {
  date: string;
  counts: IMaintainerExperienceMosCount[];
}

export interface IMaintainerStrengthMosAvailability {
  mos: string;
  available_count: number;
  total_count: number;
}

export interface IMaintainerExperienceMos {
  mos: string;
  data: IMaintainerExperienceMosData[];
}
