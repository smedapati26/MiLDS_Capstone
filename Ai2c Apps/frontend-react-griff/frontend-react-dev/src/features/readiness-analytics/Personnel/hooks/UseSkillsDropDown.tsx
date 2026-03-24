import { useContext, useMemo, useState } from 'react';

import { OptionsMapType } from '@components/dropdowns/MultiSelectDropDown';

import { useGetCrewExperienceSkillQuery } from '@store/griffin_api/personnel/slices/personnelApi';
import { useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';

import { CrewExperienceContext } from '../Accordions/CrewExperience/CrewExperienceContext';

interface SkillCount {
  skill: string;
  count: number;
}

interface CrewExperienceDataItem {
  model: string;
  actual_skills: SkillCount[];
  authorized_skills: SkillCount[];
}

const useSkillsDropDown = () => {
  const { skillModels, setSkillModels, setSkills } = useContext(CrewExperienceContext);
  const [selectedSkillValue, setSelectedSkillValue] = useState<string[] | undefined>(undefined);
  const [selectedModelValue, setSelectedModelValue] = useState<string[] | undefined>(undefined);

  const uic = useAppSelector(selectCurrentUic);

  const { data, isLoading } = useGetCrewExperienceSkillQuery({ uic });

  const modelOptions = useMemo<OptionsMapType>(() => {
    if (!data) return {};
    const options = data.reduce<OptionsMapType>(
      (acc: OptionsMapType, item: CrewExperienceDataItem) => ({
        ...acc,
        [item.model]: { label: item.model, value: item.model },
      }),
      {},
    );

    setSelectedModelValue(skillModels || Object.keys(options));
    return options;
  }, [data, skillModels]);

  const handleModelSelectionChange = (selectedValues: string[]) => {
    setSkillModels(selectedValues);
    setSelectedModelValue(selectedValues);
  };

  const filteredModelData = useMemo(() => {
    if (!data) return [];
    return data.filter((entry: CrewExperienceDataItem) => selectedModelValue?.includes(entry.model));
  }, [data, selectedModelValue]);

  const availableSkills = useMemo<string[]>(() => {
    if (!filteredModelData?.length) return [];

    const skillSet = new Set<string>();

    filteredModelData.forEach((item: CrewExperienceDataItem) => {
      item.actual_skills.forEach((skillCount: SkillCount) => skillSet.add(skillCount.skill));
      item.authorized_skills.forEach((skillCount: SkillCount) => skillSet.add(skillCount.skill));
    });

    return Array.from(skillSet);
  }, [filteredModelData]);

  const skillOptions = useMemo<OptionsMapType>(() => {
    const options = availableSkills.reduce<OptionsMapType>(
      (acc: OptionsMapType, skill: string) => ({ ...acc, [skill]: { label: skill, value: skill } }),
      {},
    );
    setSelectedSkillValue(Object.keys(options));

    return options;
  }, [availableSkills]);

  const handleSkillSelectionChange = (selectedValues: string[]) => {
    setSkills(selectedValues);
    setSelectedSkillValue(selectedValues);
  };

  const filteredSkillsData = useMemo(() => {
    if (!filteredModelData?.length || !selectedSkillValue?.length) return [];

    return filteredModelData
      .map((item: CrewExperienceDataItem) => {
        const filteredActualSkills = item.actual_skills.filter((skillCount: SkillCount) =>
          selectedSkillValue?.includes(skillCount.skill),
        );

        const filteredAuthorizedSkills = item.authorized_skills.filter((skillCount: SkillCount) =>
          selectedSkillValue?.includes(skillCount.skill),
        );

        return {
          model: item.model,
          actual_skills: filteredActualSkills,
          authorized_skills: filteredAuthorizedSkills,
        };
      })
      .filter((item) => item.actual_skills.length > 0 || item.authorized_skills.length > 0);
  }, [filteredModelData, selectedSkillValue]);

  return {
    modelOptions,
    skillOptions,
    isLoading,
    selectedSkillValue,
    selectedModelValue,
    setSkillModels,
    setSkills,
    handleModelSelectionChange,
    handleSkillSelectionChange,
    filteredSkillsData,
  };
};

export default useSkillsDropDown;
