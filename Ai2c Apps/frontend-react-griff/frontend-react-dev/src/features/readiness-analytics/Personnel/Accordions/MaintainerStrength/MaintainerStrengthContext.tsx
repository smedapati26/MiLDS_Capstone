import React, { createContext } from 'react';

interface MaintainerStrengthContextProps {
  mosRank: string[] | undefined;
  setMosRank: React.Dispatch<React.SetStateAction<string[] | undefined>>;
}

const MaintainerStrengthParams: MaintainerStrengthContextProps = {
  mosRank: undefined,
  setMosRank: () => {},
};

export const MaintainerStrengthContext = createContext<MaintainerStrengthContextProps>(MaintainerStrengthParams);
