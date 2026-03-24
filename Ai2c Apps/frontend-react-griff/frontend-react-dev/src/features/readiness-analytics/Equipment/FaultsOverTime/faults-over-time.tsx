import React from 'react';
import dayjs from 'dayjs';

import { Stack, Typography, useTheme } from '@mui/material';
import { LineChart, LineChartProps, MarkElementProps } from '@mui/x-charts';
import { DatasetType } from '@mui/x-charts/internals';

import FaultsOverTimeLegend from '@features/readiness-analytics/Equipment/FaultsOverTime/faults-over-time-legend';

import { IFaultOverTime } from '@store/griffin_api/faults/models';

const FaultsOverTime: React.FC<{ data: IFaultOverTime[] }> = ({ data }) => {
  const theme = useTheme();

  // An object that maps fault types to their corresponding shapes and colors.
  const shapesAndColors: { [key: string]: { shape: string; color: string; offset: number; label: string } } = {
    deadline: {
      shape:
        'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z',
      color: theme.palette.graph?.purple2,
      offset: 12,
      label: 'Deadline',
    },
    diagonal: {
      shape:
        'M 7.050781 19.050781 L 4.949219 16.949219 C 4.75 16.75 4.648438 16.511719 4.648438 16.238281 C 4.648438 15.960938 4.75 15.726562 4.949219 15.523438 L 15.523438 4.949219 C 15.726562 4.75 15.960938 4.648438 16.238281 4.648438 C 16.511719 4.648438 16.75 4.75 16.949219 4.949219 L 19.050781 7.074219 C 19.234375 7.257812 19.324219 7.492188 19.324219 7.773438 C 19.324219 8.058594 19.234375 8.292969 19.050781 8.476562 L 8.476562 19.050781 C 8.273438 19.25 8.039062 19.351562 7.761719 19.351562 C 7.488281 19.351562 7.25 19.25 7.050781 19.050781 Z M 7.050781 19.050781',
      color: theme.palette.graph?.teal2,
      offset: 12,
      label: 'Diagonal',
    },
    circle_x: {
      shape:
        'M 9 1.5 C 4.851562 1.5 1.5 4.851562 1.5 9 C 1.5 13.148438 4.851562 16.5 9 16.5 C 13.148438 16.5 16.5 13.148438 16.5 9 C 16.5 4.851562 13.148438 1.5 9 1.5 Z M 12.75 11.691406 L 11.691406 12.75 L 9 10.058594 L 6.308594 12.75 L 5.25 11.691406 L 7.941406 9 L 5.25 6.308594 L 6.308594 5.25 L 9 7.941406 L 11.691406 5.25 L 12.75 6.308594 L 10.058594 9 Z M 12.75 11.691406',
      color: theme.palette.graph?.magenta,
      offset: 9,
      label: 'Circle X',
    },
  };
  const faultKeys = ['deadline', 'diagonal', 'circle_x'] as const;
  type FaultKey = (typeof faultKeys)[number];

  const activeKeys: FaultKey[] = faultKeys.filter((key) => data.some((row) => row[key] && Number(row[key]) > 0));

  const activeShapesAndColors = Object.fromEntries(activeKeys.map((key) => [key, shapesAndColors[key]]));

  // Custom mark renderer
  const markSlot: React.FC<MarkElementProps> = ({ id, x, y, color }) => {
    const { shape, color: shapeColor } = shapesAndColors[id];
    const offset = shapesAndColors[id].offset;

    return (
      <path
        className={`MuiMarkElement-root MuiMarkElement-series-${id}`}
        d={shape}
        cursor="unset"
        fill={color ?? shapeColor}
        style={{
          transform: `translate(${Number(x) - offset}px, ${Number(y) - offset}px)`,
          transformOrigin: `${x}px ${y}px`,
        }}
      />
    );
  };

  const series: LineChartProps['series'] = activeKeys.map((key) => ({
    id: key,
    type: 'line',
    dataKey: key,
    color: activeShapesAndColors[key].color,
    label: activeShapesAndColors[key].label,
  }));

  // X-axis configuration
  const xAxis: LineChartProps['xAxis'] = [
    {
      scaleType: 'band',
      dataKey: 'reporting_period',
      valueFormatter: (value: string) => dayjs(value).format('MM/YYYY'),
    },
  ];

  // Y-axis configuration
  const yAxis: LineChartProps['yAxis'] = [];

  // Legend properties
  const legendProps = {
    markGap: 8,
    itemGap: 16,
    padding: 0,
  };

  // Axis tick properties
  const axisTickProps: Partial<React.SVGAttributes<SVGPathElement>> = {
    display: 'none',
  };

  // Line chart properties
  const lineChartProps: LineChartProps = {
    xAxis,
    yAxis,
    dataset: data as unknown as DatasetType,
    series,
    height: 505,
    margin: { top: 20, bottom: 20, right: 0 },
    slotProps: {
      axisTick: axisTickProps,
      legend: {
        hidden: true,
      },
    },
    slots: {
      mark: markSlot,
    },
  };

  return (
    <>
      <FaultsOverTimeLegend {...legendProps} series={series} markSlot={markSlot} />
      <Stack direction={'row'}>
        <Typography
          sx={{
            transform: 'rotate(-90deg)',
            height: 'fit-content',
            width: 144,
            margin: 'auto',
            marginLeft: '-60px',
            marginRight: '-60px',
          }}
        >
          Number of Faults
        </Typography>
        <LineChart data-testid="FaultsOverTime" {...lineChartProps} />
      </Stack>
    </>
  );
};

export default FaultsOverTime;
