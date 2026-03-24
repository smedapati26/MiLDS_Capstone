import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

import { Stack, useTheme } from '@mui/material';

import FhpChartsLegend from '@features/flight-hour-program/overview/components/FhpChartsLegend';

// 2. Register the components you are using
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  series: ChartData<'bar' | 'line', number[], string>;
  title: string;
  height?: number;
  width?: number;
  dashed?: boolean;
}

const FhpStackedBarChart: React.FC<Props> = (props: Props): React.ReactNode => {
  const theme = useTheme();
  const { series, title, height, dashed } = props;
  const isDarkMode = theme.palette.mode === 'dark';
  const modeColor = isDarkMode ? theme.palette.common.white : theme.palette.common.black;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function (context: TooltipItem<'bar' | 'line'>) {
            const originalLabel = context.dataset.label || '';
            const cleanLabel = originalLabel.split('(')[0].trim();
            let label = cleanLabel;

            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString();
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        border: {
          display: true,
          color: modeColor,
          width: 1,
        },
        stacked: true,
        grid: { display: false },
        ticks: { color: theme.palette.text.primary },
      },
      y: {
        border: {
          display: true,
          color: modeColor,
          width: 1,
        },
        title: { display: true, text: 'Flight Hours', color: theme.palette.text.primary },
        grid: { display: false },
        ticks: { color: theme.palette.text.primary },
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
        />
      </div>
    </Stack>
  );
};

export default FhpStackedBarChart;
