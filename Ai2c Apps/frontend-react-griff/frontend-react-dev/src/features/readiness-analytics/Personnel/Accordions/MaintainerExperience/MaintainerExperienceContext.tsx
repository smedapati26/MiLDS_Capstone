import React, { createContext, ReactNode, useState } from 'react';

interface MaintainerExperienceContextProps {
  maintainerLevelModels: string[] | undefined;
  setMaintainerLevelModels: React.Dispatch<React.SetStateAction<string[] | undefined>>;
}

export const MaintainerExperienceContext = createContext<MaintainerExperienceContextProps>({
  maintainerLevelModels: undefined,
  setMaintainerLevelModels: () => {},
});

interface MaintainerExperienceProviderProps {
  children: ReactNode;
}

export const MaintainerExperienceProvider = ({ children }: MaintainerExperienceProviderProps) => {
  const [maintainerLevelModels, setMaintainerLevelModels] = useState<string[] | undefined>(undefined);

  return (
    <MaintainerExperienceContext.Provider value={{ maintainerLevelModels, setMaintainerLevelModels }}>
      {children}
    </MaintainerExperienceContext.Provider>
  );
};
