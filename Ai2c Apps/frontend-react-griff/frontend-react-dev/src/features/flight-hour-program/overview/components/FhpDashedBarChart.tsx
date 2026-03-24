import React from 'react';
import type { Chart as ChartType } from 'chart.js';
import { ChartData } from 'chart.js';
import { Chart } from 'react-chartjs-2';

import { useTheme } from '@mui/material';
import { Stack } from '@mui/material';

import FhpChartsLegend from '@features/flight-hour-program/overview/components/FhpChartsLegend';

interface Props {
  series: ChartData<'bar', number[], string>;
  title: string;
  height?: number;
  width?: number;
  dashed?: boolean;
}

/* v8 ignore start */
const dashBorderPlugin = {
  id: 'dashBorderPlugin',
  afterDatasetsDraw(chart: ChartType) {
    const { ctx } = chart;
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      // Only apply to bar datasets with dashedBorder: true
      const myDataset = dataset as typeof dataset & {
        isDashed?: boolean[];
        dashedBorder?: string;
        dashedBackground?: string;
      };

      // Cast to your custom type to access projectedLessThanActual

      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((bar, index) => {
        const { x, y, base, width } = bar.getProps(['x', 'y', 'base', 'width'], true);

        // Only draw if value is not zero
        if (y === base) return;

        // Check if projected < actual for this bar
        const isDashed = myDataset.isDashed?.[index];

        // Determine where the "top" is for the dashed border
        if (isDashed) {
          ctx.save();
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);

          if (myDataset.dashedBackground) {
            ctx.fillStyle = myDataset.dashedBackground;
            ctx.beginPath();
            ctx.moveTo(x - width / 2, base);
            ctx.lineTo(x + width / 2, base);
            ctx.lineTo(x + width / 2, y);
            ctx.lineTo(x - width / 2, y);
            ctx.closePath();
            ctx.fill();
          }
          ctx.strokeStyle = myDataset.dashedBorder as string;
          ctx.beginPath();
          ctx.moveTo(x - width / 2, base);
          ctx.lineTo(x - width / 2, y);
          ctx.stroke();

          // Draw right border
          ctx.beginPath();
          ctx.moveTo(x + width / 2, base);
          ctx.lineTo(x + width / 2, y);
          ctx.stroke();

          // Draw top border
          ctx.beginPath();
          ctx.moveTo(x - width / 2, y);
          ctx.lineTo(x + width / 2, y);
          ctx.stroke();
        }
        // Do NOT draw bottom border

        ctx.setLineDash([]);
        ctx.restore();
      });
    });
  },
};
/* v8 ignore stop */

/**
 * chart for all of the  overview flight hour summary bar charts
 * @param {Props} props object
 * @param {ChartData<'bar' , number[], string>} props.series data to show visuals for in line or bar form
 * @param {string} props.title name to give the chart for hte key
 * @param {number} props.height that is required by Chart to render, will calculate if not given
 * @param {number} props.width optional to render chart, will calculate if not given
 * @param {boolean} props.dashed for the legends that needs to be dashed
 * @returns ReactNode element
 */

const FhpDashedBarChart: React.FC<Props> = (props: Props): React.ReactNode => {
  const theme = useTheme();
  const { series, title, height, dashed } = props;
  const isDarkMode = theme.palette.mode === 'dark';
  const modeColor = isDarkMode ? theme.palette.common.white : theme.palette.common.black;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    plugins: {
      tooltip: { mode: 'index' as const, intersect: false },
      dashBorderPlugin: {},
    },
    scales: {
      x: {
        border: {
          display: true,
          color: modeColor,
          width: 1,
        },
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.primary,
        },
      },
      y: {
        border: {
          display: true,
          color: modeColor,
          width: 1,
        },
        title: { display: true, text: 'Flight Hours', color: theme.palette.text.primary },
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.primary,
        },
      },
    },
  };

  return (
    <Stack direction="column" spacing={4}>
      <FhpChartsLegend series={series.datasets} dashed={dashed} />
      <div style={{ height: height }} data-testid="chart-container">
        <Chart
          key={`${title}-${JSON.stringify(series)}`}
          data={series}
          type="bar"
          options={options}
          style={{ width: '100%' }}
          plugins={[dashBorderPlugin]}
        />
      </div>
    </Stack>
  );
};

export default FhpDashedBarChart;
