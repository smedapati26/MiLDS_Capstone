import React, { createContext, Dispatch, SetStateAction, useMemo, useState } from 'react';

import PmxAccordion from '@components/PmxAccordion';

import MaintainerExperienceMos from './MaintainerExperienceMos';

interface ParamsContext {
  mos: string[] | undefined;
  setMos: Dispatch<SetStateAction<ParamsContext['mos']>>;
}

const MaintainerExperienceParams: ParamsContext = {
  mos: undefined,
  setMos: () => {},
};

export const MaintainerExperienceContext = createContext<ParamsContext>(MaintainerExperienceParams);

const MaintainerExperience = () => {
  const [mos, setMos] = useState<ParamsContext['mos']>();

  const [expanded, setExpanded] = useState(false);

  const handleAccordionChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const maintainerExperienceContextVals = useMemo(
    () => ({
      mos,
      setMos,
    }),
    [mos, setMos],
  );

  return (
    <PmxAccordion
      heading="Maintainer Experience"
      isLoading={false}
      expanded={expanded}
      onChange={handleAccordionChange}
      sx={{ m: 0, '&.Mui-expanded': { m: 0 } }}
    >
      <MaintainerExperienceContext.Provider value={maintainerExperienceContextVals}>
        <MaintainerExperienceMos />
      </MaintainerExperienceContext.Provider>
    </PmxAccordion>
  );
};

export default MaintainerExperience;
