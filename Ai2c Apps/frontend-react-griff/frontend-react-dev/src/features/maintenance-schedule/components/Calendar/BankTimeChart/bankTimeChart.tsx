import React, { lazy } from 'react';
const Plot = lazy(() => import('react-plotly.js'));

import usePlotlyCleanup from 'src/hooks/usePlotlyCleanup';

import { useTheme } from '@mui/material';

import { IBankTimeForecast } from '@store/griffin_api/auto_dsr/models';

/**
 * @param {IBankTimeForecast[]} data Bank time projections for the currently selected global unit
 * @returns {Plot} Plotly-JS line plot of projected bank time for the currently selected global unit
 */

export const BankTimeChart: React.FC<{ data: Array<IBankTimeForecast> }> = ({ data }) => {
  usePlotlyCleanup();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const modeColor = isDarkMode ? theme.palette.common.white : theme.palette.common.black;
  const hoverColor = isDarkMode ? '#1E1E1E' : theme.palette.common.white;
  const textColor = modeColor;

  const tickvals = Array.from({ length: 21 }, (_, i) => i * 5); // Generate tickmarks every 5%
  const ticktext = tickvals.map((val) => `${val}%`);

  const getColorForIndex = (index: number) => {
    const colors = [
      '#9F1853', // Softer red
      '#002D9C', // Royal blue
      '#0072B1', // Teal
      '#012749', // Navy blue
      '#42A5F5', // Light blue
      '#F06292', // Pink
      '#FFB74D', // Orange
      '#9575CD', // Purple
      '#4DB6AC', // Teal
      '#FF9F9F', // Light red
      '#A1887F', // Brown
    ];
    return colors[index % colors.length];
  };
  const getColorForIndexDarkMode = (index: number) => {
    const colors = [
      '#47D3FF', // Teal
      '#FFFFFF', // Gray
      '#5794FF', // Blue
      '#BAE6FF', // Light blue
      '#FF7EB6', // Pink
      '#FFB74D', // Orange
      '#9575CD', // Purple
      '#4DB6AC', // Teal
      '#FF9F9F', // Light red
      '#A1887F', // Brown
    ];
    return colors[index % colors.length];
  };

  const generateTraces = (data: Array<IBankTimeForecast>) => {
    return data.map((modelData, index) => {
      const dates: Array<string> = [];
      const values: Array<number> = [];

      modelData.projections.map((prediction: { date: string; value: number }) => {
        dates.push(prediction.date);
        values.push(prediction.value);
      });

      return {
        x: dates,
        y: values,
        name: modelData.model,
        type: 'scatter' as const,
        mode: 'lines' as const,
        line: {
          shape: 'spline' as const, // smooths out lines to match design
          color: isDarkMode ? getColorForIndexDarkMode(index) : getColorForIndex(index),
        },
      };
    });
  };

  const plotData = generateTraces(data);
  const dateTickVals = plotData.length > 0 ? plotData[0].x.filter((_, index) => index % 2 === 0) : [];

  return (
    <Plot
      data={plotData}
      layout={{
        font: {
          family: theme.typography.fontFamily,
          size: 12,
          color: textColor,
        },
        xaxis: {
          type: 'date',
          tickformat: '%d %b %y',
          tickvals: dateTickVals,
          ticklabelposition: 'outside right',
          showgrid: false,
          showline: true,
          linewidth: 1,
          linecolor: modeColor,
          zeroline: true,
          zerolinewidth: 1,
          zerolinecolor: modeColor,
        },
        yaxis: {
          showgrid: false,
          showline: true,
          linewidth: 1,
          linecolor: modeColor,
          zeroline: false,
          zerolinewidth: 1,
          zerolinecolor: modeColor,
          tickmode: 'array',
          ticktext: ticktext,
          tickvals: tickvals,
          tickfont: { family: theme.typography.fontFamily, color: textColor },
        },
        hovermode: 'x unified',
        hoverlabel: {
          bgcolor: hoverColor,
          font: {
            size: 16,
            color: textColor,
          },
        },
        margin: { t: 10, r: 20, b: 20, l: 40 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        showlegend: false,
      }}
      style={{ width: '100%', height: '386px' }}
      config={{ responsive: true }}
    />
  );
};

export default BankTimeChart;
