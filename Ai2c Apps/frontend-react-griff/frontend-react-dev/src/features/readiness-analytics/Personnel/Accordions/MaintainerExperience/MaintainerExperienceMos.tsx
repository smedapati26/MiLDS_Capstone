import { useContext, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { PlotData } from 'plotly.js';

import { Box, Stack, Typography, useTheme } from '@mui/material';

import BarGraphTemplate from '@components/BarGraphTemplate';
import MultiSelectDropDown from '@components/dropdowns/MultiSelectDropDown';
import GraphLegendTemplate from '@components/GraphLegendTemplate';
import PmxCarousel from '@components/PmxCarousel';

import { useGetMaintainerExperienceMosQuery } from '@store/amap_api/personnel/slices';
import { useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';

import { MaintainerExperienceContext } from './MaintainerExperienceContext';

const MaintainerExperienceMos = () => {
  const { maintainerLevelModels, setMaintainerLevelModels } = useContext(MaintainerExperienceContext);

  const uic = useAppSelector(selectCurrentUic);
  const theme = useTheme();
  const { data, isLoading } = useGetMaintainerExperienceMosQuery({ uic });
  const [selectedValue, setSelectedValue] = useState<string[] | undefined>(undefined);
  const [filteredData, setFilteredData] = useState<Record<string, Partial<PlotData>[]>>({});

  const series = useMemo(
    () => [
      { label: 'ML0', color: theme.palette.graph?.purple },
      { label: 'ML1', color: theme.palette.graph?.teal2 },
      { label: 'ML2', color: theme.palette.graph?.cyan2 },
      { label: 'ML3', color: theme.palette.graph?.blue },
      { label: 'ML4', color: theme.palette.graph?.magenta },
    ],
    [theme],
  );

  const options = useMemo(() => {
    if (!data) return {};
    setSelectedValue(maintainerLevelModels || Object.keys(data));
    return Object.keys(data).reduce((acc, mos) => ({ ...acc, [mos]: { label: mos, value: mos } }), {});
  }, [data, setSelectedValue, maintainerLevelModels]);

  const barData = useMemo(() => {
    if (!data) return {};

    const mosTracesMap: Record<string, Partial<PlotData>[]> = {};

    for (const [mos, mosData] of Object.entries(data)) {
      const { dates, traces } = mosData as { dates: string[]; traces: Partial<PlotData>[] };
      mosTracesMap[mos] = traces.map((trace, index) => ({
        ...trace,
        x: dates.map((date) => dayjs(date).format('DDMMMYY').toUpperCase()),
        marker: { color: series[index]?.color },
      }));
    }

    return mosTracesMap;
  }, [data, series]);

  useEffect(() => {
    if (!data) return;
    setFilteredData(Object.fromEntries(Object.entries(barData).filter(([key]) => selectedValue?.includes(key))));
  }, [barData, data, selectedValue]);

  const handleSelectionChange = (selectedValues: string[]) => {
    setMaintainerLevelModels(selectedValues);
    setSelectedValue(selectedValues);
  };

  return (
    <Stack direction={'column'} gap={5}>
      <MultiSelectDropDown
        width={'455px'}
        options={options}
        label={'MOS'}
        isLoading={isLoading}
        onSelectionChange={handleSelectionChange}
        value={selectedValue}
      />
      <GraphLegendTemplate series={series} />
      <PmxCarousel maxVisible={Object.keys(filteredData).length < 2 ? Object.keys(filteredData).length : 2}>
        {filteredData && Object.entries(filteredData).length > 0 ? (
          Object.entries(filteredData).map(([mos, traces]) => (
            <Box key={mos}>
              <Typography variant="h6" gutterBottom>
                {mos}
              </Typography>
              <BarGraphTemplate height={465} yLabel={'# of Personnel'} plotData={traces} barmode="stack" />
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

export default MaintainerExperienceMos;
