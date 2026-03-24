import { createContext, Dispatch, SetStateAction } from 'react';

interface ParamsContext {
  readinessLevelModels: string[] | undefined;
  skillModels: string[] | undefined;
  skills: string[] | undefined;
  setReadinessLevelModels: Dispatch<SetStateAction<ParamsContext['readinessLevelModels']>>;
  setSkillModels: Dispatch<SetStateAction<ParamsContext['skillModels']>>;
  setSkills: Dispatch<SetStateAction<ParamsContext['skills']>>;
}

const CrewExperienceParams: ParamsContext = {
  readinessLevelModels: undefined,
  skillModels: undefined,
  skills: undefined,
  setReadinessLevelModels: () => {},
  setSkillModels: () => {},
  setSkills: () => {},
};

export const CrewExperienceContext = createContext<ParamsContext>(CrewExperienceParams);
