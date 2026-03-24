import React, { useMemo } from 'react';
import { BarControllerDatasetOptions, ChartDataset } from 'chart.js';
import dayjs from 'dayjs';
import { _DeepPartialObject } from 'node_modules/chart.js/dist/types/utils';

import { Theme, Typography, useTheme } from '@mui/material';

import { titlecase } from '@ai2c/pmx-mui';

import BarCard from '@features/flight-hour-program/overview/components/BarCard';
import FhpDashedBarChart from '@features/flight-hour-program/overview/components/FhpDashedBarChart';
import { groupByFamilyAndSumDates } from '@features/flight-hour-program/overview/components/helper';

import { IFhpProgress } from '@store/griffin_api/fhp/models';

interface Props {
  data: IFhpProgress;
  height: number;
  width?: number;
}

type MyBarDataset = ChartDataset<'bar', number[]> &
  _DeepPartialObject<BarControllerDatasetOptions> & {
    isDashed?: boolean[];
    dashedBorder?: string;
    dashedBackground?: string;
  };

export const getColor = ({ family, theme }: { family: string; theme: Theme }) => {
  switch (family) {
    case 'APACHE':
      return theme.palette.graph.purple;
    case 'BLACK HAWK':
      return theme.palette.graph.cyan;
    case 'CHINOOK':
      return theme.palette.graph.teal;

    default:
      return theme.palette.stacked_bars.cyan2;
  }
};

export const blendColor = (baseColor: string, overlayColor: string, overlayOpacity: number) => {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const base = hexToRgb(baseColor);
  const overlay = hexToRgb(overlayColor);

  const blended = {
    r: overlay && base ? Math.round(overlay.r * overlayOpacity + base.r * (1 - overlayOpacity)) : 0,
    g: overlay && base ? Math.round(overlay.g * overlayOpacity + base.g * (1 - overlayOpacity)) : 0,
    b: overlay && base ? Math.round(overlay.b * overlayOpacity + base.b * (1 - overlayOpacity)) : 0,
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  };

  return rgbToHex(blended.r, blended.g, blended.b);
};

/**
 * Model prediction bar chart
 * @param {Props} props object
 * @param {IFhpProgress} props.data to show predictions for
 * @param {number} props.height for char tot render
 * @returns ReactNode element
 */

const ModelPredictionBarChart: React.FC<Props> = ({ data, height, width }: Props): React.ReactNode => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const dataByFamily = useMemo(() => groupByFamilyAndSumDates(data.models), [data.models]);
  const xLabels = data.unit.map((d) => dayjs(d.date as Date).format('MM/YYYY'));

  const barDatasets = dataByFamily.map((item) => {
    const lowerData: number[] = [];
    const upperData: number[] = [];
    const lowerIsDashed: boolean[] = [];
    const upperIsDashed: boolean[] = [];

    xLabels.forEach((date) => {
      const value = item.dates.find((d) => dayjs(d.date as Date).format('MM/YYYY') === date);

      if (!value) {
        lowerData.push(0);
        upperData.push(0);
        lowerIsDashed.push(false);
        upperIsDashed.push(false);
        return;
      }

      const actual = value.actualFlightHours || 0;
      const projected = value.projectedFlightHours || 0;
      const isProjectedLess = projected < actual;

      if (isProjectedLess) {
        // Projected at bottom, actual - projected on top
        lowerData.push(projected);
        upperData.push(actual - projected);
        lowerIsDashed.push(true);
        upperIsDashed.push(false);
      } else {
        // Actual at bottom, projected - actual on top
        lowerData.push(actual);
        upperData.push(projected - actual);
        lowerIsDashed.push(false);
        upperIsDashed.push(true);
      }
    });

    const datasetLower: MyBarDataset = {
      label: `${titlecase(item.family)} Flight Hours`,
      data: lowerData,
      backgroundColor: getColor({ family: item.family, theme }),
      borderColor: getColor({ family: item.family, theme }),
      stack: item.family,
      type: 'bar' as const,
      isDashed: lowerIsDashed,
      borderRadius: 4, // rounds all bars
      dashedBorder: isDarkMode ? theme.palette.grey.l60 : theme.palette.grey.d60,
      dashedBackground: blendColor(getColor({ family: item.family, theme }), theme.palette.layout.background16, 0.6),
    };

    const datasetUpper: MyBarDataset = {
      label: `${titlecase(item.family)} Flight Hours`,
      data: upperData,
      isDashed: upperIsDashed,
      backgroundColor: getColor({ family: item.family, theme }),
      borderColor: getColor({ family: item.family, theme }),
      stack: item.family,
      type: 'bar' as const,
      borderRadius: 4, // rounds all bars
      borderWidth: 0,
      dashedBorder: isDarkMode ? theme.palette.grey.l60 : theme.palette.grey.d60,
      dashedBackground: isDarkMode ? theme.palette.layout.base : theme.palette.layout.background16,
    };

    return [datasetLower, datasetUpper];
  });

  const chartData = {
    labels: xLabels,
    datasets: barDatasets.flat(),
  };

  return (
    <BarCard>
      <Typography variant="body2">Model Predictions</Typography>
      <FhpDashedBarChart series={chartData} title={'model-prediction'} height={height} width={width} dashed={true} />
    </BarCard>
  );
};

export default ModelPredictionBarChart;
