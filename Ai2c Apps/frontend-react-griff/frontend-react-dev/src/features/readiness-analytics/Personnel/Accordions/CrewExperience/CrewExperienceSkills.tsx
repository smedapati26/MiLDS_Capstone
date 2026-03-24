import { useMemo } from 'react';
import { PlotData, PlotType } from 'plotly.js';

import { Box, Stack, Typography, useTheme } from '@mui/material';

import BarGraphTemplate from '@components/BarGraphTemplate';
import MultiSelectDropDown, { OptionsMapType } from '@components/dropdowns/MultiSelectDropDown';
import PmxCarousel from '@components/PmxCarousel';

import { ICrewExperienceSkill, ISkillCount } from '@store/griffin_api/personnel/models';

import useSkillsDropDown from '../../hooks/UseSkillsDropDown';

const CrewExperienceSkills = () => {
  const theme = useTheme();
  const {
    modelOptions,
    skillOptions,
    isLoading,
    selectedSkillValue,
    selectedModelValue,
    handleModelSelectionChange,
    handleSkillSelectionChange,
    filteredSkillsData,
  }: {
    modelOptions: OptionsMapType;
    skillOptions: OptionsMapType;
    isLoading: boolean;
    selectedSkillValue: string[] | undefined;
    selectedModelValue: string[] | undefined;
    handleModelSelectionChange: (value: string[]) => void;
    handleSkillSelectionChange: (value: string[]) => void;
    filteredSkillsData: ICrewExperienceSkill[] | null;
  } = useSkillsDropDown();

  const barData = useMemo(() => {
    if (!filteredSkillsData || !Array.isArray(filteredSkillsData) || filteredSkillsData.length === 0) {
      return [];
    }

    return filteredSkillsData.map((modelData: ICrewExperienceSkill) => {
      const { actual_skills = [], authorized_skills = [], model } = modelData;

      // Get unique skills across both arrays
      const allSkills = [
        ...new Set([
          ...actual_skills.map((item: ISkillCount) => item.skill),
          ...authorized_skills.map((item: ISkillCount) => item.skill),
        ]),
      ];

      // Create maps for quick lookups
      const actualMap: Record<string, number> = Object.fromEntries(
        actual_skills.map((item: ISkillCount) => [item.skill, item.count]),
      );
      const authorizedMap: Record<string, number> = Object.fromEntries(
        authorized_skills.map((item: ISkillCount) => [item.skill, item.count]),
      );
      return {
        model: model,
        traces: [
          // Actual skills (solid bars)
          {
            x: allSkills,
            y: allSkills.map((skill) => actualMap[skill] || 0),
            name: 'Actual',
            type: 'bar' as PlotType,
            marker: {
              color: theme.palette.stacked_bars.blue,
              line: {
                color: theme.palette.stacked_bars.blue,
                width: 1,
              },
            },
            width: 0.1,
          },

          // Authorized skills (dashed bars)
          {
            x: allSkills,
            y: allSkills.map((skill) => authorizedMap[skill] - (actualMap[skill] || 0)),
            hovertext: allSkills.map((skill) => `${authorizedMap[skill]}`),
            hovertemplate: '%{hovertext}',
            name: 'Authorized',
            type: 'bar' as PlotType,
            marker: {
              color: theme.palette.layout.background16,
              line: {
                color: theme.palette.grey[800],
                width: 1,
              },
            },
            width: 0.1,
          },
        ] as Partial<PlotData>[],
      };
    });
  }, [filteredSkillsData, theme]);

  return (
    <Stack direction="column" gap={5}>
      <Stack direction="row" gap={5}>
        <MultiSelectDropDown
          width="455px"
          options={modelOptions}
          label="Model"
          isLoading={isLoading}
          onSelectionChange={handleModelSelectionChange}
          value={selectedModelValue}
        />
        <MultiSelectDropDown
          width="455px"
          options={skillOptions}
          label="Skill"
          isLoading={isLoading}
          onSelectionChange={handleSkillSelectionChange}
          value={selectedSkillValue}
        />
      </Stack>
      <PmxCarousel>
        {barData && barData.length > 0 ? (
          barData.map((bar) => (
            <Box key={bar.model}>
              <Typography variant="h6" gutterBottom>
                {bar.model}
              </Typography>
              <BarGraphTemplate height={465} yLabel={'# of Personnel'} plotData={bar.traces} barmode="stack" />
            </Box>
          ))
        ) : (
          <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} height={465}>
            <Typography>{isLoading ? 'Loading' : 'No data available'}</Typography>
          </Stack>
        )}
      </PmxCarousel>
    </Stack>
  );
};

export default CrewExperienceSkills;
