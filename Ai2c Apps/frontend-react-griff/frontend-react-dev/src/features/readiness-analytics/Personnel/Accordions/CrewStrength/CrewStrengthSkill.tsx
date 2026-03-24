import { useContext, useMemo, useState } from 'react';
import { PlotData, PlotType } from 'plotly.js';

import { Stack, Typography, useTheme } from '@mui/material';

import BarGraphTemplate from '@components/BarGraphTemplate';
import MultiSelectDropDown, { OptionsMapType } from '@components/dropdowns/MultiSelectDropDown';

import { ICrewStrengthSkillRes } from '@store/griffin_api/personnel/models';
import { useGetCrewStrengthSkillsQuery } from '@store/griffin_api/personnel/slices/personnelApi';
import { useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';

import { CrewStrengthContext } from './CrewStrengthContext';

const CrewStrengthSkill = () => {
  const theme = useTheme();
  const uic = useAppSelector(selectCurrentUic);

  const { skillRank, setSkillRank } = useContext(CrewStrengthContext);
  const { data, isLoading } = useGetCrewStrengthSkillsQuery({ uic });
  const [selectedSkillRank, setSelectedSkillRank] = useState<string[] | undefined>(undefined);

  // filter out data based on selected ranks
  const filteredData = useMemo(() => {
    if (!data) return [];
    return skillRank ? data.filter((entry: ICrewStrengthSkillRes) => skillRank?.includes(entry.rank)) : data;
  }, [data, skillRank]);

  // parse out all unique ranks from data
  const availableRanks = useMemo<string[]>(() => {
    if (!data?.length) return [];

    const rankSet = new Set<string>();
    data.forEach((item: ICrewStrengthSkillRes) => rankSet.add(item.rank));

    return Array.from(rankSet);
  }, [data]);

  // convert ranks into object for the drop down
  const rankOptions = useMemo<OptionsMapType>(() => {
    const options = availableRanks.reduce<OptionsMapType>(
      (acc: OptionsMapType, rank: string) => ({ ...acc, [rank]: { label: rank, value: rank } }),
      {},
    );

    setSelectedSkillRank(skillRank || Object.keys(options));

    return options;
  }, [availableRanks, setSelectedSkillRank, skillRank]);

  // handler to select user selection from dropdown
  const handleRankChange = (selectedValues: string[]) => {
    setSelectedSkillRank(selectedValues);
    setSkillRank(selectedValues);
  };

  // Process data to get unique skills from filtered data and aggregate their values
  const processedSkillData = useMemo(() => {
    if (!filteredData?.length) return { uniqueSkills: [], skillMap: {} };

    // Create a map of skills with their aggregated values
    const skillMap: Record<string, { actual: number; authorized: number }> = {};

    filteredData.forEach((item: ICrewStrengthSkillRes) => {
      const { skill, actual_count, num_authorized } = item;

      if (!skillMap[skill]) {
        skillMap[skill] = { actual: 0, authorized: 0 };
      }

      skillMap[skill].actual += actual_count;
      skillMap[skill].authorized += num_authorized;
    });

    // Create a list of unique skills
    const uniqueSkills = Object.keys(skillMap);

    return { uniqueSkills, skillMap };
  }, [filteredData]);

  // convert filtered and processed data into bar graph data format
  const barData = useMemo(() => {
    const { uniqueSkills, skillMap } = processedSkillData;

    if (!uniqueSkills.length) {
      return [];
    }

    const skills = uniqueSkills;

    return [
      // Using a custom stacked bar approach
      {
        x: skills,
        y: skills.map((skill) => skillMap[skill].actual),
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
      {
        x: skills,
        y: skills.map((skill) => Math.max(0, skillMap[skill].authorized - skillMap[skill].actual)),
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
    ] as Partial<PlotData>[];
  }, [processedSkillData, theme]);

  return (
    <Stack direction="column" gap={5}>
      <MultiSelectDropDown
        width="455px"
        options={rankOptions}
        label="Rank"
        isLoading={isLoading}
        onSelectionChange={handleRankChange}
        value={selectedSkillRank}
      />

      {barData.length > 0 && !isLoading ? (
        <BarGraphTemplate height={465} yLabel={'# of Personnel'} plotData={barData} barmode="stack" />
      ) : (
        <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} height={465}>
          <Typography>{isLoading ? 'Loading' : 'No data available'}</Typography>
        </Stack>
      )}
    </Stack>
  );
};

export default CrewStrengthSkill;
