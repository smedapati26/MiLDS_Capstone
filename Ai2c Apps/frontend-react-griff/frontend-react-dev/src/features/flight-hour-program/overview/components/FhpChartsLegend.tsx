import React from 'react';
import { ChartDataset } from 'chart.js';

import { Box, Stack, Typography, useTheme } from '@mui/material';

import PmxCarousel from '@components/PmxCarousel';

interface Props {
  series: ChartDataset<'bar' | 'line', number[]>[];
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse' | undefined;
  dashed?: boolean;
}

// get unique list of series based on labels
function getUniqueDatasets<T extends ChartDataset<'bar' | 'line', number[]>>(series: T[]): T[] {
  const seen = new Set<string | undefined>();
  return series.filter((ds) => {
    if (seen.has(ds.label)) return false;
    seen.add(ds.label);
    return true;
  });
}

// get the color for the legend
export function resolveColor(color: unknown): string {
  if (typeof color === 'string') return color;
  if (Array.isArray(color)) return color[0] as string;

  return 'grey';
}

const LegendItem = ({
  item,
  index,
  dashed = false,
}: {
  item: ChartDataset<'bar' | 'line', number[]>;
  index: number;
  dashed?: boolean;
}): React.ReactNode => {
  return (
    <Stack
      key={`${index}-${item.label}`}
      direction="row"
      spacing={2}
      alignItems="center"
      data-testid={`legend-item-${item.label?.replace(/\s/g, '-')}`}
    >
      <Box
        data-testid={dashed ? 'legend-color-dashed' : 'legend-color'}
        sx={{
          width: 12,
          height: 12,
          bgcolor: resolveColor(item.backgroundColor),
          border: `1px`,
          borderRadius: '50%',
          borderStyle: dashed ? 'dashed' : 'solid',
          borderColor: resolveColor(item.borderColor),
        }}
      />
      <Typography variant="body1">{item.label}</Typography>
    </Stack>
  );
};

/**
 * Chart Legends, since the <ChartsLegend /> component is limited.
 * Will create a carousel if more than 6 is present
 * @param {Props} props object
 * @param {ChartDataset<'bar' | 'line', number[]>[]} props.series data to get legend for
 * @param {boolean} props.dashed for the legends that needs to be dashed
 * @returns ReactNode element
 */

const FhpChartsLegend: React.FC<Props> = ({ series, direction = 'row', dashed = false }: Props): React.ReactNode => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const uniqueSeries = getUniqueDatasets(series);
  const projected: ChartDataset<'bar' | 'line', number[]> = {
    label: 'Projected Flight Hours',
    backgroundColor: isDarkMode ? theme.palette.layout.base : theme.palette.layout.background16,
    borderColor: isDarkMode ? theme.palette.grey.l60 : theme.palette.grey.d60,
    data: [],
  };

  return (
    <Stack direction={direction} spacing={3}>
      <PmxCarousel maxVisible={6}>
        {uniqueSeries.map((item, index) => LegendItem({ item, index }))}
        {dashed && projected && LegendItem({ item: projected, index: series.length, dashed: dashed })}
      </PmxCarousel>
    </Stack>
  );
};

export default FhpChartsLegend;
