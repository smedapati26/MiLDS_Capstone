import { useMemo, useState } from 'react';

import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import PmxAccordion from '@components/PmxAccordion';

import { CrewExperienceContext } from './CrewExperienceContext';
import CrewExperienceReadinessLevel from './CrewExperienceReadinessLevel';
import CrewExperienceSkills from './CrewExperienceSkills';

enum CrewExperienceViewEnum {
  rl = 'READINESS LEVEL',
  skill = 'SKILL',
}

const CrewExperience = () => {
  const [readinessLevelModels, setReadinessLevelModels] = useState<string[] | undefined>();
  const [skillModels, setSkillModels] = useState<string[] | undefined>();
  const [skills, setSkills] = useState<string[] | undefined>();
  // Use this to manage the view type state and changes
  const [view_type, setView_type] = useState(CrewExperienceViewEnum.rl);
  const viewTypeOptions = useMemo(() => Object.entries(CrewExperienceViewEnum).map(([key, val]) => ({ key, val })), []);

  // New state to manage accordion expanded state
  const [expanded, setExpanded] = useState(false);

  // Handler for accordion expand change
  const handleAccordionChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const handleViewTypeChange = (_event: React.MouseEvent<HTMLElement>, newViewType: CrewExperienceViewEnum) => {
    if (newViewType) {
      setView_type(newViewType);
    }
  };

  const crewExperienceContextVals = useMemo(
    () => ({
      readinessLevelModels,
      setReadinessLevelModels,
      skillModels,
      setSkillModels,
      skills,
      setSkills,
    }),
    [readinessLevelModels, skillModels, skills],
  );

  return (
    <PmxAccordion
      heading="Crew Experience"
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

      <CrewExperienceContext.Provider value={crewExperienceContextVals}>
        {useMemo(() => {
          switch (view_type) {
            case CrewExperienceViewEnum.rl:
              return <CrewExperienceReadinessLevel />;
            case CrewExperienceViewEnum.skill:
              return <CrewExperienceSkills />;
            default:
              return null;
          }
        }, [view_type])}
      </CrewExperienceContext.Provider>
    </PmxAccordion>
  );
};

export default CrewExperience;
