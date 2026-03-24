import React, { useMemo, useState } from 'react';

import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import PmxAccordion from '@components/PmxAccordion';

import { MaintainerStrengthContext } from './MaintainerStrengthContext';
import MaintainerStrengthMos from './MaintainerStrengthMos';
import MaintainerStrengthSkill from './MaintainerStrengthSkill';

enum MaintainerStrengthViewEnum {
  mos = 'MOS',
  skill = 'SKILL',
}

const MaintainerStrength = () => {
  // Use this to manage the context for the skills rank and mos rank dropdowns applied to the context
  const [mosRank, setMosRank] = useState<string[] | undefined>();
  const [skillRank, setSkillRank] = useState<string[] | undefined>();

  const [view_type, setView_type] = useState(MaintainerStrengthViewEnum.mos);

  const viewTypeOptions = useMemo(
    () => Object.entries(MaintainerStrengthViewEnum).map(([key, val]) => ({ key, val })),
    [],
  );

  const [expanded, setExpanded] = useState(false);

  const handleAccordionChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const handleViewTypeChange = (_event: React.MouseEvent<HTMLElement>, newViewType: MaintainerStrengthViewEnum) => {
    if (newViewType) {
      setView_type(newViewType);
    }
  };

  // Set initial values for the context
  const maintainerStrengthContextVals = useMemo(
    () => ({
      mosRank,
      setMosRank,
      skillRank,
      setSkillRank,
    }),
    [mosRank, skillRank],
  );

  return (
    <PmxAccordion
      heading="Maintainer Strength"
      isLoading={false}
      expanded={expanded}
      onChange={handleAccordionChange}
      sx={{ m: 0, '&.Mui-expanded': { m: 0 } }}
    >
      <ToggleButtonGroup
        color="primary"
        value={view_type}
        exclusive
        onChange={handleViewTypeChange}
        aria-label="View Type"
        sx={{ marginBottom: '20px' }}
      >
        {viewTypeOptions.map(({ key, val }) => (
          <ToggleButton key={key} value={val} sx={{ width: '228px' }}>
            {val}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <MaintainerStrengthContext.Provider value={maintainerStrengthContextVals}>
        {useMemo(() => {
          switch (view_type) {
            case MaintainerStrengthViewEnum.mos:
              return <MaintainerStrengthMos />;
            case MaintainerStrengthViewEnum.skill:
              return <MaintainerStrengthSkill />;
            default:
              return null;
          }
        }, [view_type])}
      </MaintainerStrengthContext.Provider>
    </PmxAccordion>
  );
};

export default MaintainerStrength;
