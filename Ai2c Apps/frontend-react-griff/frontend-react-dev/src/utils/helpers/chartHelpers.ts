import { Theme } from '@mui/material/styles';

export const getVariant = (view: string): 'top' | 'bottom' | undefined => {
  if (view === 'highest') return 'top';
  if (view === 'lowest') return 'bottom';
  return undefined;
};

export const getChartColors = (index: number, theme: Theme): string => {
  // returns the chart colors, modulo of index
  const colorMap: Record<number, string> = {
    0: theme.palette.graph.purple,
    1: theme.palette.graph.cyan,
    2: theme.palette.graph.teal,
    3: theme.palette.graph.pink,
    4: theme.palette.graph.green,
    5: theme.palette.graph.blue,
    6: theme.palette.graph.magenta,
    7: theme.palette.graph.yellow,
    8: theme.palette.graph.teal2,
    9: theme.palette.graph.cyan2,
    10: theme.palette.graph.orange,
    11: theme.palette.graph.purple2,
  };

  return colorMap[index % 12];
};
