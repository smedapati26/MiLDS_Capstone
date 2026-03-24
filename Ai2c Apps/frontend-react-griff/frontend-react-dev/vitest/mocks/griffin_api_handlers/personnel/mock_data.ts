import {
  ICrewExperienceReadinessLevel,
  ICrewExperienceReadinessLevelTransformedData,
  ICrewExperienceSkill,
} from '@store/griffin_api/personnel/models';
import { ICrewStrengthMosRes, ICrewStrengthSkillRes } from '@store/griffin_api/personnel/models/ICrewStrength';

export const mockCrewExperienceSkill: ICrewExperienceSkill = {
  model: 'CH-47F',
  actual_skills: [{ skill: 'Pilot', count: 5 }],
  authorized_skills: [{ skill: 'Pilot', count: 6 }],
};

export const mockCrewExperienceReadinessLevel: ICrewExperienceReadinessLevel[] = [
  {
    model: 'CH-47F',
    count: 10,
    rl_type: 'trained',
    readiness_level: 'high',
  },
  {
    model: 'CH-47F',
    count: 5,
    rl_type: 'untrained',
    readiness_level: 'low',
  },
];

export const mockCrewExperienceReadinessLevelTransformed: ICrewExperienceReadinessLevelTransformedData = {
  'CH-47F': {
    high: {
      trained: 10,
    },
    low: {
      untrained: 5,
    },
  },
};

export const mockPersonnelSkills: string[] = ['Pilot', 'Co-Pilot', 'Crew Chief'];

export const mockCrewStrengthSkills: ICrewStrengthSkillRes[] = [
  {
    skill: 'Pilot',
    rank: 'CW2',
    actual_count: 3,
    num_authorized: 4,
  },
];

export const mockCrewStrengthMos: ICrewStrengthMosRes[] = [
  {
    mos: '15P',
    rank: 'SGT',
    actual_count: 2,
    num_authorized: 3,
  },
];
