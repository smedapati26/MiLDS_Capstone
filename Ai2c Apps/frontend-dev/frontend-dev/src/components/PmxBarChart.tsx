import { Typography, useTheme } from '@mui/material';
import { BarChart, legendClasses } from '@mui/x-charts';

interface PmxBarChartProps {
  data: Array<{
    data: number[];
    label: string;
    color: string;
  }>;
  title?: string;
  isLoading?: boolean;
}
const PmxBarChart = ({ data, title, isLoading = false }: PmxBarChartProps) => {
  const theme = useTheme();
  const maxValue = Math.max(...data.flatMap((x) => x.data)) + 4;

  return (
    <>
      {title && <Typography variant="h6">{title}</Typography>}
      <BarChart
        loading={isLoading}
        layout="horizontal"
        yAxis={[{ data: [''], scaleType: 'band' }]}
        xAxis={[
          {
            label: '# of Phases Conducted',
            scaleType: 'linear',
            tickMinStep: 1,
            min: 0,
            max: maxValue,
          },
        ]}
        series={
          data?.map((x) => ({
            data: x.data,
            label: x.label,
            color: x.color,
          })) ?? []
        }
        slotProps={{
          legend: {
            position: {
              vertical: 'bottom',
              horizontal: 'left',
            },
          },
        }}
        margin={{ left: 8, right: 8, bottom: 70 }}
        height={200}
        grid={{ horizontal: true, vertical: false }}
        sx={{
          [`& .${legendClasses.mark}`]: {
            ry: 10,
            stroke: theme.palette.text.primary,
            strokeWidth: 0,
          },
        }}
      />
    </>
  );
};

export default PmxBarChart;
