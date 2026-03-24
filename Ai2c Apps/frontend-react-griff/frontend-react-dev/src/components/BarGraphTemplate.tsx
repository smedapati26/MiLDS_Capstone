import { Config, Layout, PlotData } from 'plotly.js';
import Plot from 'react-plotly.js';

import { useTheme } from '@mui/material';

const BarGraphTemplate = ({
  plotData,
  yLabel,
  height,
  barmode = 'group',
  yAxisTickFormat,
  y2Label,
  y2AxisTickFormat,
  hoverLabelBgColor,
}: {
  plotData: Partial<PlotData>[];
  yLabel: string;
  height: number;
  barmode?: Layout['barmode'];
  yAxisTickFormat?: string;
  y2Label?: string;
  y2AxisTickFormat?: string;
  hoverLabelBgColor?: string;
}) => {
  const theme = useTheme();

  const layout: Partial<Layout> = {
    autosize: true,
    barmode,
    bargroupgap: 0.15,
    hovermode: 'x unified',
    hoverlabel: {
      bgcolor: hoverLabelBgColor || theme.palette.background.paper,
    },
    xaxis: {
      categoryorder: 'trace',
      showgrid: false,
      showline: true,
      type: 'category',
    },
    yaxis: {
      title: {
        font: {
          color: theme.palette.text.primary,
          family: theme.typography.fontFamily,
          size: 14,
        },
        text: yLabel,
      },
      zeroline: true,
      zerolinecolor: '#969696',
      zerolinewidth: 1,
      showgrid: false,
      showline: true,
      tickformat: yAxisTickFormat,
    },
    margin: {
      t: 15,
      pad: 0,
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    showlegend: false,
    height,
    font: {
      color: theme.palette.text.primary,
      family: theme.typography.fontFamily,
      size: 12,
    },
  };

  if (y2Label) {
    layout.yaxis2 = {
      title: {
        font: {
          color: theme.palette.text.primary,
          family: theme.typography.fontFamily,
          size: 14,
        },
        text: y2Label,
      },
      zeroline: true,
      zerolinecolor: '#969696',
      zerolinewidth: 1,
      showgrid: false,
      showline: true,
      tickformat: y2AxisTickFormat,
      overlaying: 'y',
      side: 'right',
    };
  }

  // Config object
  const config: Partial<Config> = {
    responsive: true,
    displayModeBar: false,
    modeBarButtons: false,
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot data={plotData} layout={layout} config={config} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default BarGraphTemplate;
