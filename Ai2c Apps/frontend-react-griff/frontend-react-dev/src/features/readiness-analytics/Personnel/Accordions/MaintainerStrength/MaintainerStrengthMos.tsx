import { useContext, useMemo, useState } from 'react';
import { PlotData, PlotType } from 'plotly.js';

import { Stack, Typography, useTheme } from '@mui/material';

import BarGraphTemplate from '@components/BarGraphTemplate';
import MultiSelectDropDown, { OptionsMapType } from '@components/dropdowns/MultiSelectDropDown';

import { IMaintainerStrengthMosAvailability } from '@store/amap_api/personnel/models/IMaintainerExperience';
import { useGetMaintainerStrengthMosQuery } from '@store/amap_api/personnel/slices';
import { useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';

import { MaintainerStrengthContext } from './MaintainerStrengthContext';

const MaintainerStrengthMos = () => {
  const theme = useTheme();
  const uic = useAppSelector(selectCurrentUic);

  const { mosRank, setMosRank } = useContext(MaintainerStrengthContext);
  const { data, isLoading } = useGetMaintainerStrengthMosQuery({ uic });
  const [selectedMosRank, setSelectedMosRank] = useState<string[] | undefined>(undefined);

  // filter out data based on selected ranks
  const filteredData = useMemo(() => {
    if (!data) return [];
    return mosRank ? data.filter((entry: IMaintainerStrengthMosAvailability) => mosRank?.includes(entry.mos)) : data;
  }, [data, mosRank]);

  // parse out all unique mos from data
  const availableMos = useMemo<string[]>(() => {
    if (!data?.length) return [];

    const mosSet = new Set<string>();
    data.forEach((item: IMaintainerStrengthMosAvailability) => mosSet.add(item.mos));

    return Array.from(mosSet);
  }, [data]);

  // convert mos into object for the drop down
  const mosOptions = useMemo<OptionsMapType>(() => {
    const options = availableMos.reduce<OptionsMapType>(
      (acc: OptionsMapType, mos: string) => ({ ...acc, [mos]: { label: mos, value: mos } }),
      {},
    );

    setSelectedMosRank(mosRank || Object.keys(options));

    return options;
  }, [availableMos, setSelectedMosRank, mosRank]);

  // handler to select user selection from dropdown
  const handleMosChange = (selectedValues: string[]) => {
    setSelectedMosRank(selectedValues);
    setMosRank(selectedValues);
  };

  // convert filtered data into bar graph data format
  const barData = useMemo(() => {
    if (!filteredData.length) return [];

    const mos = filteredData.map((item) => item.mos);

    return [
      {
        x: mos,
        y: filteredData.map((item) => item.available_count),
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
        x: mos,
        y: filteredData.map((item) => item.total_count - item.available_count),
        hovertext: filteredData.map((item) => `${item.total_count}`),
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
    ] as Partial<PlotData>[];
  }, [filteredData, theme]);

  return (
    <Stack direction="column" gap={5}>
      <MultiSelectDropDown
        width="455px"
        options={mosOptions}
        label="MOS"
        isLoading={isLoading}
        onSelectionChange={handleMosChange}
        value={selectedMosRank}
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

export default MaintainerStrengthMos;
