/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy } from 'react';

import { useTheme } from '@mui/material';

/**
 * Represents the color types used in the graph.
 */
export type ColorType = 'purple' | 'teal' | 'cyan' | 'blue' | 'magenta';

/**
 * Represents the type of marker used in the graph.
 */
export type MarkerType = 'Evaluation' | 'Training' | 'Award';

/**
 * Represents a single data item in the graph.
 */
export type GraphDataItem = {
  /** The value for the X-axis. */
  xAxis: string;

  /** The value for the Y-axis. */
  yAxis: number;

  /** The color of the data point. */
  color: ColorType;

  /** Any additional data fields. */
  [key: string]: any;
};

/**
 * Props for the PmxLineGraph component.
 */
interface PmxLineGraphProps {
  /** The data to be displayed in the graph. */
  graphData: GraphDataItem[];

  /** The title for the X-axis. */
  xAxisTitle: string;

  /** The title for the Y-axis. */
  yAxisTitle: string;

  /** The overall title of the graph. */
  graphTitle: string;

  /** Optional promotion lines to be displayed in the graph. */
  promotionLines?: { date: string; label: string }[];
}

// Lazy-loaded Plotly component for rendering the graph
const Plot = lazy(() => import('react-plotly.js'));

const formatDate = (dateStr: string) => {
  const [month, day, year] = dateStr.split('/');
  return `${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}`;
};
/**
 * PmxLineGraph component renders a line graph with markers using Plotly.
 *
 * @param graphData - Array of data items representing the graph's points.
 * @param promotionLines - Optional lines highlighting specific dates or events.
 * @param xAxisTitle - Title for the X-axis.
 * @param yAxisTitle - Title for the Y-axis.
 * @param graphTitle - Title of the graph.
 * @returns A styled Plotly line graph.
 */
const PmxLineGraph = ({ graphData, promotionLines, xAxisTitle, yAxisTitle, graphTitle }: PmxLineGraphProps) => {
  const theme = useTheme();
  const knownFields = ['xAxis', 'yAxis', 'color'];

  // Extract custom fields from the graph data
  const customFields = graphData.reduce(
    (acc, item) => {
      Object.keys(item).forEach((key) => {
        if (!knownFields.includes(key)) {
          acc[key] = graphData.map((entry) => entry[key]);
        }
      });
      return acc;
    },
    {} as Record<string, any>,
  );

  // Configure the shapes for promotion lines
  const shapes = promotionLines?.length
    ? promotionLines.map((line) => ({
        type: 'line',
        x0: formatDate(line.date),
        x1: formatDate(line.date),
        y0: 0,
        y1: 5,
        line: {
          color: theme.palette.mode === 'dark' ? theme.palette.grey.d60 : theme.palette.grey.l60,
          width: 3,
          dash: 'dashdot',
        },
      }))
    : [];

  // Configure annotations for promotion lines
  const annotations = promotionLines?.length
    ? promotionLines.map((line) => ({
        x: line.date,
        y: 5,
        text: line.label,
        showarrow: false,
        xanchor: 'left',
        yanchor: 'middle',
        textangle: -270,
        font: {
          color: theme.palette.text.primary,
          size: 16,
        },
      }))
    : [];

  const graphConfig = {
    shapes,
    annotations,
  };

  // Get unique event types for legend entries
  const uniqueEventTypes = [...new Set(graphData.map((item) => item['Event Type']))];

  // Prepare data for Plotly
  const data = [
    {
      x: graphData.map((item) => formatDate(item.xAxis)),
      y: graphData.map((item) => item.yAxis),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Events',
      showlegend: true,
      marker: {
        size: 20,
        color: graphData.map((item) => item.color),
      },
      line: { color: theme.palette.graph.purple2, width: 5 },
      hovertemplate: '%{text}<extra></extra>',
      text: graphData.map((item) =>
        Object.keys(customFields)
          .map((key) => `${key}: ${item[key]}`)
          .join('<br>'),
      ),
    },
    ...uniqueEventTypes.map((eventType) => ({
      x: [null],
      y: [null],
      type: 'scatter',
      mode: 'markers',
      name: eventType,
      showlegend: true,
      marker: {
        size: 20,
        color: graphData.find((item) => item['Event Type'] === eventType)?.color || 'gray', // Assign correct color
      },
    })),
  ];

  const layout = {
    paper_bgcolor: theme.palette.layout.background7,
    plot_bgcolor: theme.palette.layout.background7,
    title: {
      text: graphTitle,
      font: {
        size: 16,
        color: theme.palette.text.primary,
      },
    },
    xaxis: {
      title: {
        text: xAxisTitle,
        font: {
          size: 16,
          color: theme.palette.text.primary,
        },
      },
      tickfont: {
        size: 16,
        color: theme.palette.text.primary,
      },
      tickangle: -30,
      type: 'date',
    },
    yaxis: {
      title: {
        text: yAxisTitle,
        font: {
          size: 16,
          color: theme.palette.text.primary,
        },
      },
      tickfont: {
        size: 16,
        color: theme.palette.text.primary,
      },
    },
    ...graphConfig,
    showLegend: true,
    legend: {
      orientation: 'v',
      font: { color: theme.palette.text.primary, size: 16 },
      bgcolor: theme.palette.layout.background7,
    },
    hovermode: 'closest',
    hoverlabel: {
      bordercolor: theme.palette.layout.background8,
      bgcolor: theme.palette.layout.background8,
      font: {
        color: theme.palette.text.primary,
        size: 12,
      },
    },
  };

  // @ts-expect-error
  return <Plot data={data} layout={layout} style={{ width: '100%', height: '600px' }} />;
};

export default PmxLineGraph;
