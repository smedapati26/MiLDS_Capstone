import { useContext, useEffect, useMemo, useState } from 'react';
import { PlotData } from 'plotly.js';

import { Box, Stack, Typography, useTheme } from '@mui/material';

import BarGraphTemplate from '@components/BarGraphTemplate';
import MultiSelectDropDown from '@components/dropdowns/MultiSelectDropDown';
import GraphLegendTemplate from '@components/GraphLegendTemplate';
import PmxCarousel from '@components/PmxCarousel';

import { useGetCrewExperienceReadinessLevelQuery } from '@store/griffin_api/personnel/slices/personnelApi';
import { useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';

import { CrewExperienceContext } from './CrewExperienceContext';

const CrewExperienceReadinessLevel = () => {
  const { readinessLevelModels, setReadinessLevelModels } = useContext(CrewExperienceContext);

  const uic = useAppSelector(selectCurrentUic);
  const theme = useTheme();
  const { data, isLoading } = useGetCrewExperienceReadinessLevelQuery({ uic });
  const [selectedValue, setSelectedValue] = useState<string[] | undefined>(undefined);
  const [filteredData, setFilteredData] = useState<Record<string, Partial<PlotData>[]>>({});

  const options = useMemo(() => {
    if (!data) return {};
    setSelectedValue(readinessLevelModels || Object.keys(data));
    return Object.keys(data).reduce((acc, model) => ({ ...acc, [model]: { label: model, value: model } }), {});
  }, [data, setSelectedValue, readinessLevelModels]);

  const barData = useMemo(() => {
    if (!data) return {};

    const readinessLevelsLabel = ['RL3', 'RL2', 'RL1', 'RL0']; // Ordered from highest to lowest
    const readinessLevels = ['3', '2', '1', '0'];
    // Get models to process
    const modelsToProcess = Object.keys(data);

    // Create a map of model to traces
    const modelTracesMap: Record<string, Partial<PlotData>[]> = {};

    // For each model
    modelsToProcess.forEach((model) => {
      // Create DN trace
      const dnTrace: Partial<PlotData> = {
        x: readinessLevelsLabel,
        y: readinessLevels.map((level) => data[model]?.[level]?.DN ?? 0),
        type: 'bar',
        name: `${model} - DN`,
        marker: { color: theme.palette.stacked_bars.purple },
        width: 0.25,
      };

      // Create NVG trace
      const nvgTrace: Partial<PlotData> = {
        x: readinessLevelsLabel,
        y: readinessLevels.map((level) => data[model]?.[level]?.NVG ?? 0),
        type: 'bar',
        name: `${model} - NVG`,
        marker: { color: theme.palette.stacked_bars.teal2 },
        width: 0.25,
      };

      modelTracesMap[model] = [dnTrace, nvgTrace];
    });
    return modelTracesMap;
  }, [data, theme]);

  useEffect(() => {
    if (!data) return;
    setFilteredData(Object.fromEntries(Object.entries(barData).filter(([key]) => selectedValue?.includes(key))));
  }, [barData, data, selectedValue]);

  const handleSelectionChange = (selectedValues: string[]) => {
    setReadinessLevelModels(selectedValues);
    setSelectedValue(selectedValues);
  };

  const series = [
    { label: 'Day', color: theme.palette.graph?.purple },
    { label: 'Night', color: theme.palette.graph?.teal2 },
  ];

  return (
    <Stack direction={'column'} gap={5}>
      <Typography>
        Select MOS to view analytics from the past 3 months and expectaions for the next 3 months.
      </Typography>
      <MultiSelectDropDown
        width={'455px'}
        options={options}
        label={'Model'}
        isLoading={isLoading}
        onSelectionChange={handleSelectionChange}
        value={selectedValue}
      />
      <GraphLegendTemplate series={series} />
      <PmxCarousel maxVisible={Object.keys(filteredData).length < 3 ? Object.keys(filteredData).length : 3}>
        {filteredData && Object.entries(filteredData).length > 0 ? (
          Object.entries(filteredData).map(([model, traces]) => (
            <Box key={model}>
              <Typography variant="h6" gutterBottom>
                {model}
              </Typography>
              <BarGraphTemplate height={465} yLabel={'# of Personnel'} plotData={traces} />
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

export default CrewExperienceReadinessLevel;
