export interface ISkillCount {
  skill: string;
  count: number;
}

export interface ICrewExperienceSkill {
  model: string;
  actual_skills: ISkillCount[];
  authorized_skills: ISkillCount[];
}

export interface ICrewExperienceReadinessLevel {
  model: string;
  count: number;
  rl_type: string;
  readiness_level: string;
}

export interface ICrewExperienceReadinessLevelTransformedData {
  [model: string]: {
    [readiness_level: string]: {
      [rl_type: string]: number;
    };
  };
}

export interface ICrewExperienceReadinessLevelArgs {
  uic: string;
  models?: string[];
}
export interface ICrewExperienceSkillArgs extends ICrewExperienceReadinessLevelArgs {
  skills?: string[];
}
