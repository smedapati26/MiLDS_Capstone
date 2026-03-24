import { Layout, LayoutAxis, PlotData } from 'plotly.js';
import Plot from 'react-plotly.js';

import { useTheme } from '@mui/material';

type AxisStandoff = Partial<LayoutAxis> & { ticklabelstandoff?: number };

const PlotGraphTemplate = ({
  plotData,
  yLabel,
  height,
}: {
  plotData: Partial<PlotData>[];
  yLabel: string;
  height: number;
}) => {
  const theme = useTheme();

  const layout: Partial<Layout> = {
    colorway: theme?.palette?.graph ? Object.values(theme?.palette?.graph) : undefined,
    font: {
      color: theme.palette.text.primary,
      family: theme.typography.fontFamily,
      size: 12,
    },
    legend: {
      bgcolor: 'transparent',
      bordercolor: 'transparent',
      orientation: 'h',
      x: -0.05,
    },
    margin: {
      b: 0,
      l: 0,
      r: 0,
      t: 0,
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    showlegend: true,
    height,
    xaxis: {
      ticklabelstandoff: 10,
      dtick: 1,
      linecolor: theme.palette.text.primary,
      linewidth: 1,
      showgrid: false,
      showline: true,
      tickfont: {
        color: theme.palette.text.primary,
        family: theme.typography.fontFamily,
      },
      tickmode: 'array',
      title: {
        font: {
          color: theme.palette.text.primary,
          family: theme.typography.fontFamily,
          size: 14,
        },
      },
      zeroline: false,
    } as AxisStandoff,
    yaxis: {
      ticklabelstandoff: 10,
      dtick: 100,
      linecolor: theme.palette.text.primary,
      linewidth: 1,
      showgrid: false,
      showline: true,
      showticklabels: true,
      tickfont: {
        color: theme.palette.text.primary,
        family: theme.typography.fontFamily,
      },
      tickmode: 'linear' as const,
      title: {
        font: {
          color: theme.palette.text.primary,
          family: theme.typography.fontFamily,
          size: 14,
        },
        text: yLabel,
        standoff: 15,
      },
      zeroline: false,
    } as AxisStandoff,
  };

  const config = {
    displayModeBar: false,
    displaylogo: false,
    responsive: true,
    staticPlot: true,
  };

  return <Plot data={plotData} layout={layout} config={config} style={{ width: '100%', height: '100%' }} />;
};

export default PlotGraphTemplate;
