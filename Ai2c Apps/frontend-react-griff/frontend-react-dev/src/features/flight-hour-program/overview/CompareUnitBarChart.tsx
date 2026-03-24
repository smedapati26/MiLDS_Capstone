import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

import { Typography, useTheme } from '@mui/material';

import PmxMultiSelect from '@components/PmxMultiSelect';
import BarCard from '@features/flight-hour-program/overview/components/BarCard';
import FhpStackedBarChart from '@features/flight-hour-program/overview/components/FhpStackedBarChart';
import { getGraphColorByIndex } from '@features/flight-hour-program/overview/components/helper';

import { useGetAutoDsrSingleUnitInfoQuery } from '@store/griffin_api/auto_dsr/slices';
import { IFhpProgress } from '@store/griffin_api/fhp/models';
import { useGetFhpProgressMultipleUnitsQuery } from '@store/griffin_api/fhp/slices';
import { useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';

interface Props {
  data: IFhpProgress;
  startDate: string;
  endDate: string;
  height?: number;
  width?: number;
}

/**
 * Bar chart to show the comparison of actual flight hours vs those of similar units
 * @param {Props} props object
 * @param {string} props.startDate to get data for
 * @param {string} props.startDate to get data for
 * @param {number} props.height number for chart height, necessary for rendering
 * @param {width?} props.width number for chart width
 * @returns ReactNode element
 */

const CompareUnitBarChart: React.FC<Props> = ({
  data,
  startDate,
  endDate,
  height = 400,
  width,
}: Props): React.ReactNode => {
  const theme = useTheme();
  const globalUic = useAppSelector(selectCurrentUic);
  const [units, setUnits] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const xLabels = data.unit.map((d) => dayjs(d.date as Date).format('MM/YYYY'));
  const { data: unitInfo } = useGetAutoDsrSingleUnitInfoQuery({ uic: globalUic }, { skip: !globalUic });

  const unitDict = useMemo(() => {
    return (
      unitInfo?.similarUnits.reduce(
        (acc, item) => {
          acc[item.uic] = item.shortName;
          return acc;
        },
        {} as Record<string, string>,
      ) ?? {}
    );
  }, [unitInfo]);

  useEffect(() => {
    setUnits(Object.values(unitDict));
    setSelectedUnits(Object.values(unitDict));
  }, [unitDict]);

  const onUnitSelect = (newValues: string[]) => {
    setSelectedUnits(newValues);
  };

  const { data: similarUnitData } = useGetFhpProgressMultipleUnitsQuery(
    { uics: Object.keys(unitDict), uic: '', startDate: startDate, endDate: endDate },
    { skip: Object.keys(unitDict).length === 0 },
  );
  const filteredUnitData = useMemo(
    () => similarUnitData?.filter((item) => selectedUnits.includes(unitDict[item.uic])),
    [selectedUnits, similarUnitData, unitDict],
  );

  const barDatasets = [
    {
      label: `${unitInfo?.shortName} Flight Hours`,
      data: data.unit.map((d) => d.actualFlightHours),
      backgroundColor: theme.palette.stacked_bars.cyan2,
      borderColor: theme.palette.stacked_bars.cyan2,
      stack: `${unitInfo?.shortName}-flight-hours`,
      type: 'bar' as const,
      borderRadius: 4,
      barThickness: 50,
      order: 2,
    },
  ];

  const lineDatasets =
    filteredUnitData?.map((item, index) => ({
      label: `${unitDict[item.uic]} Flight Hours`,
      data: item.data.unit.map((d) => d.actualFlightHours),
      borderColor: getGraphColorByIndex(index, theme),
      backgroundColor: getGraphColorByIndex(index, theme),
      type: 'line' as const,
      yAxisID: 'y',
      tension: 0,
      fill: false,
      pointRadius: 0,
      borderWidth: 2,
      order: 1,
    })) ?? [];

  const chartData = {
    labels: xLabels,
    datasets: [...barDatasets, ...lineDatasets],
  };

  return (
    <BarCard>
      <Typography variant="body2">Compare Unit</Typography>
      <PmxMultiSelect label="Compare" onChange={onUnitSelect} options={units} values={selectedUnits} />
      <FhpStackedBarChart series={chartData} title="compare-unit" height={height} width={width} />
    </BarCard>
  );
};

export default CompareUnitBarChart;
