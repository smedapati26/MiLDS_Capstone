import { useMemo, useState } from 'react';

import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import PmxAccordion from '@components/PmxAccordion';

import { CrewStrengthContext } from './CrewStrengthContext';
import CrewStrengthMos from './CrewStrengthMos';
import CrewStrengthSkill from './CrewStrengthSkill';

enum CrewStrengthViewEnum {
  mos = 'MOS',
  skill = 'SKILL',
}

const CrewStrength = () => {
  // Use this to manage the context for the skills rank and mos rank dropdowns applied to the context
  const [mosRank, setMosRank] = useState<string[] | undefined>();
  const [skillRank, setSkillRank] = useState<string[] | undefined>();

  // Use this to manage the view type state and changes
  const [view_type, setView_type] = useState(CrewStrengthViewEnum.mos);

  // New state to manage accordion expanded state
  const [expanded, setExpanded] = useState(false);

  // Handler for accordion expand change
  const handleAccordionChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  // Simple key value for toggle button group options
  const viewTypeOptions = useMemo(() => Object.entries(CrewStrengthViewEnum).map(([key, val]) => ({ key, val })), []);

  // Handler for user interacting for user interacting with toggle button group
  const handleViewTypeChange = (_event: React.MouseEvent<HTMLElement>, newViewType: CrewStrengthViewEnum) => {
    if (newViewType) {
      setView_type(newViewType);
    }
  };

  // Set initial values for the context
  const crewStrengthContextVals = useMemo(
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
      heading="Crew Strength"
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
      <CrewStrengthContext.Provider value={crewStrengthContextVals}>
        {useMemo(() => {
          switch (view_type) {
            case CrewStrengthViewEnum.mos:
              return <CrewStrengthMos />;
            case CrewStrengthViewEnum.skill:
              return <CrewStrengthSkill />;
            default:
              return null;
          }
        }, [view_type])}
      </CrewStrengthContext.Provider>
    </PmxAccordion>
  );
};

export default CrewStrength;
