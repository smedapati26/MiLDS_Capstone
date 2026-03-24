import { createContext, Dispatch, SetStateAction } from 'react';

interface ParamsContext {
  mosRank: string[] | undefined;
  skillRank: string[] | undefined;

  setMosRank: Dispatch<SetStateAction<ParamsContext['mosRank']>>;
  setSkillRank: Dispatch<SetStateAction<ParamsContext['skillRank']>>;
}

const CrewStrengthParams: ParamsContext = {
  mosRank: undefined,
  skillRank: undefined,

  setMosRank: () => {},
  setSkillRank: () => {},
};

export const CrewStrengthContext = createContext<ParamsContext>(CrewStrengthParams);
