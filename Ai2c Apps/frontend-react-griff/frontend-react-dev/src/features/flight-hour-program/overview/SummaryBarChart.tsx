import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';

import { FormControlLabel, FormGroup, Stack, Switch, Theme, Typography, useTheme } from '@mui/material';

import { titlecase } from '@ai2c/pmx-mui';

import BarCard from '@features/flight-hour-program/overview/components/BarCard';
import FhpStackedBarChart from '@features/flight-hour-program/overview/components/FhpStackedBarChart';
import { groupByFamilyAndSumDates } from '@features/flight-hour-program/overview/components/helper';

import { IFhpProgress } from '@store/griffin_api/fhp/models';

interface Props {
  data: IFhpProgress;
  title?: string;
  hasSwitch?: boolean;
  height?: number;
  width?: number;
  condensed?: boolean;
  showModels?: boolean;
  isCarousel?: boolean;
}

export const getColor = ({ index, theme }: { index: number; theme: Theme }) => {
  const colors = [theme.palette.stacked_bars.blue, theme.palette.stacked_bars.teal2, theme.palette.stacked_bars.cyan2];
  return colors[index % colors.length];
};

/**
 * The card that has the summary chart data with all of it's formatting and calculations
 * @param {Props} props component prop
 * @param {IFhpProgress} props.data data to show
 * @param {boolean?} props.hasSwitch to show show the switch selector in the card
 * @param {string} props.title title of chart to render
 * @param {number} props.height number for chart height, necessary for rendering
 * @param {width?} props.width number for chart width
 * @param {boolean} props.condensed boolean to select bar width.
 * @param {boolean} props.showModels boolean to decide which graph to show
 * @param {boolean} props.isCarousel to tell component it's part of a carousel, so set the width to 100%
 * @returns ReactNode element
 */

const SummaryBarChart: React.FC<Props> = ({
  data,
  hasSwitch = true,
  title = 'Unit Summary',
  height = 400,
  width,
  condensed = false,
  showModels = false,
  isCarousel = true,
}: Props) => {
  const theme = useTheme();

  const [showByModel, setShowByModel] = useState(showModels);
  const dataByFamily = useMemo(() => groupByFamilyAndSumDates(data.models), [data.models]);
  const xLabels = data.unit.map((d) => dayjs(d.date as Date).format('MM/YYYY'));

  // Bar datasets
  const barDatasets = showByModel
    ? dataByFamily.map((item, index) => {
        const dataPoints = xLabels.map(
          (date) => item.dates.find((d) => dayjs(d.date as Date).format('MM/YYYY') === date)?.actualFlightHours || 0,
        );

        const total = dataPoints.reduce((sum, current) => sum + current, 0);

        return {
          label: `${titlecase(item.family)} Flight Hours (Total: ${total.toLocaleString()})`,
          data: dataPoints,
          backgroundColor: getColor({ index, theme }),
          borderColor: getColor({ index, theme }),
          stack: 'actual-flight-hours',
          type: 'bar' as const,
          borderRadius: 4,
          barThickness: condensed ? 23 : 50,
          order: 2,
        };
      })
    : (() => {
        const dataPoints = data.unit.map((d) => d.actualFlightHours);
        const total = dataPoints.reduce((sum, current) => sum + current, 0);

        return [
          {
            label: `Actual Flight Hours (Total: ${total.toLocaleString()})`,
            data: dataPoints,
            backgroundColor: theme.palette.stacked_bars.cyan2,
            borderColor: theme.palette.stacked_bars.cyan2,
            stack: 'actual-flight-hours',
            type: 'bar' as const,
            borderRadius: 4,
            barThickness: condensed ? 23 : 50,
            order: 2,
          },
        ];
      })();

  // --- Projected Flight Hours Data ---
  const projectedFlightHoursData = data.unit.map((d) => d.projectedFlightHours);
  const projectedTotal = projectedFlightHoursData.reduce((sum, current) => sum + current, 0);

  // --- Predicted Flight Hours Data ---
  const predictedFlightHoursData = data.unit.map((d) => d.predictedFlightHours);
  const showPredictedLine = predictedFlightHoursData.some((hours) => hours > 0);

  // --- Line Datasets ---
  const lineDatasets = [
    // 1. Projected Flight Hours Dataset (always shown)
    {
      label: `Projected Flight Hours (Total: ${projectedTotal.toLocaleString()})`, // <-- Label updated
      data: projectedFlightHoursData, // <-- Re-using the variable
      borderColor: theme.palette.stacked_bars.magenta,
      backgroundColor: theme.palette.stacked_bars.magenta,
      type: 'line' as const,
      yAxisID: 'y',
      tension: 0,
      fill: false,
      pointRadius: 0,
      borderWidth: 2,
      order: 1,
    },
    // 2. Predicted Flight Hours Dataset (conditional)
    ...(showPredictedLine
      ? (() => {
          // Calculate total only if the dataset is being shown
          const predictedTotal = predictedFlightHoursData.reduce((sum, current) => sum + current, 0);
          return [
            {
              label: `Predicted Flight Hours (Total: ${predictedTotal.toLocaleString()})`, // <-- Label updated
              data: predictedFlightHoursData,
              borderColor: theme.palette.stacked_bars.purple,
              backgroundColor: theme.palette.stacked_bars.purple,
              type: 'line' as const,
              yAxisID: 'y',
              fill: false,
              tension: 0,
              pointRadius: 0,
              borderDash: [8, 4],
              borderWidth: 2,
              order: 1,
            },
          ];
        })()
      : []),
  ];

  const chartData = {
    labels: xLabels,
    datasets: [...barDatasets, ...lineDatasets],
  };

  return (
    <BarCard isCarousel={isCarousel} data-testid="fhp-summary-bar-chart">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2">{title}</Typography>
        {hasSwitch && (
          <FormGroup>
            <FormControlLabel
              label="Show by Model"
              control={<Switch checked={showByModel} onChange={() => setShowByModel((v) => !v)} />}
            />
          </FormGroup>
        )}
      </Stack>
      <FhpStackedBarChart series={chartData} title={titlecase(title)} height={height} width={width} />
    </BarCard>
  );
};

export default SummaryBarChart;
