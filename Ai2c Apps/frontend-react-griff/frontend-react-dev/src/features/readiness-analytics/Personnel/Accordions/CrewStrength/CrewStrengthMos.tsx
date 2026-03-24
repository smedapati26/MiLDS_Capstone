import { useContext, useMemo, useState } from 'react';
import { PlotData, PlotType } from 'plotly.js';

import { Stack, Typography, useTheme } from '@mui/material';

import BarGraphTemplate from '@components/BarGraphTemplate';
import MultiSelectDropDown, { OptionsMapType } from '@components/dropdowns/MultiSelectDropDown';

import { ICrewStrengthMosRes } from '@store/griffin_api/personnel/models';
import { useGetCrewStrengthMosQuery } from '@store/griffin_api/personnel/slices/personnelApi';
import { useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';

import { CrewStrengthContext } from './CrewStrengthContext';

const CrewStrengthMos = () => {
  const theme = useTheme();
  const uic = useAppSelector(selectCurrentUic);

  const { mosRank, setMosRank } = useContext(CrewStrengthContext);
  const { data, isLoading } = useGetCrewStrengthMosQuery({ uic });
  const [selectedMosRank, setSelectedMosRank] = useState<string[] | undefined>(undefined);

  // filter out data based on selected ranks
  const filteredData = useMemo(() => {
    if (!data) return [];
    return mosRank ? data.filter((entry: ICrewStrengthMosRes) => mosRank?.includes(entry.rank)) : data;
  }, [data, mosRank]);

  // parse out all unique ranks from data
  const availableRanks = useMemo<string[]>(() => {
    if (!data?.length) return [];

    const rankSet = new Set<string>();
    data.forEach((item: ICrewStrengthMosRes) => rankSet.add(item.rank));

    return Array.from(rankSet);
  }, [data]);

  // convert ranks into object for the drop down
  const rankOptions = useMemo<OptionsMapType>(() => {
    const options = availableRanks.reduce<OptionsMapType>(
      (acc: OptionsMapType, rank: string) => ({ ...acc, [rank]: { label: rank, value: rank } }),
      {},
    );

    setSelectedMosRank(mosRank || Object.keys(options));

    return options;
  }, [availableRanks, setSelectedMosRank, mosRank]);

  // handler to select user selection from dropdown
  const handleRankChange = (selectedValues: string[]) => {
    setSelectedMosRank(selectedValues);
    setMosRank(selectedValues);
  };

  // Process data to get unique mos from filtered data and aggregate their values
  const processedMosData = useMemo(() => {
    if (!filteredData?.length) return { uniqueMos: [], mosMap: {} };

    // Create a map of mos with their aggregated values
    const mosMap: Record<string, { actual: number; authorized: number }> = {};

    filteredData.forEach((item: ICrewStrengthMosRes) => {
      const { mos, actual_count, num_authorized } = item;

      if (!mosMap[mos]) {
        mosMap[mos] = { actual: 0, authorized: 0 };
      }

      mosMap[mos].actual += actual_count;
      mosMap[mos].authorized += num_authorized;
    });

    // Create a list of unique mos
    const uniqueMos = Object.keys(mosMap);

    return { uniqueMos, mosMap };
  }, [filteredData]);

  // convert filtered and processed data into bar graph data format
  const barData = useMemo(() => {
    const { uniqueMos, mosMap } = processedMosData;

    if (!uniqueMos.length) {
      return [];
    }

    const mos = uniqueMos;

    return [
      // Using a custom stacked bar approach
      {
        x: mos,
        y: mos.map((mos) => mosMap[mos].actual),
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
        y: mos.map((mos) => Math.max(0, mosMap[mos].authorized - mosMap[mos].actual)),
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
  }, [processedMosData, theme]);

  return (
    <Stack direction="column" gap={5}>
      <MultiSelectDropDown
        width="455px"
        options={rankOptions}
        label="Rank"
        isLoading={isLoading}
        onSelectionChange={handleRankChange}
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

export default CrewStrengthMos;
