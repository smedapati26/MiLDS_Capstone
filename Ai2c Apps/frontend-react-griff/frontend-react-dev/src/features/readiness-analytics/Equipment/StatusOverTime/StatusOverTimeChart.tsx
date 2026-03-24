import { FC } from 'react';
import dayjs from 'dayjs';
import { PlotData } from 'plotly.js';

import { useTheme } from '@mui/material';

import BarGraphTemplate from '@components/BarGraphTemplate';

import { IStatusOverTime } from '@store/griffin_api/readiness/models';

type DataPercentages = {
  reportingMonth: string;
  fmcHoursPercentage: number;
  pmcsHoursPercentage: number;
  pmcmHoursPercentage: number;
  nmcsHoursPercentage: number;
  dadeHoursPercentage: number;
  nmcmHoursPercentage: number;
};

const StatusOverTimeChart: FC<{
  data: IStatusOverTime[];
  unscheduledMaintenanceData: { date: string; unscheduled: number }[];
}> = ({ data, unscheduledMaintenanceData }) => {
  const theme = useTheme();

  // You can now use unscheduledMaintenanceData to add a y2 line graph or other visualizations

  const dataPercentages: DataPercentages[] = data.map((x) => {
    return {
      reportingMonth: x.reportingMonth,
      fmcHoursPercentage: x.totalFmcHours / x.totalHoursInStatus,
      pmcsHoursPercentage: x.totalPmcsHours / x.totalHoursInStatus,
      pmcmHoursPercentage: x.totalPmcmHours / x.totalHoursInStatus,
      nmcsHoursPercentage: x.totalNmcsHours / x.totalHoursInStatus,
      dadeHoursPercentage: x.totalDadeHours / x.totalHoursInStatus,
      nmcmHoursPercentage: x.totalFieldHours / x.totalHoursInStatus,
    };
  });

  const categories = [
    {
      key: 'fmcHoursPercentage' as keyof DataPercentages,
      name: 'FMC Hours',
      color: theme.palette.operational_readiness_status.fmc,
    },
    {
      key: 'pmcsHoursPercentage' as keyof DataPercentages,
      name: 'PMCS Hours',
      color: theme.palette.operational_readiness_status.pmcs,
    },
    {
      key: 'pmcmHoursPercentage' as keyof DataPercentages,
      name: 'PMCM Hours',
      color: theme.palette.operational_readiness_status.pmcm,
    },
    {
      key: 'nmcsHoursPercentage' as keyof DataPercentages,
      name: 'NMCS Hours',
      color: theme.palette.operational_readiness_status.nmcs,
    },
    {
      key: 'nmcmHoursPercentage' as keyof DataPercentages,
      name: 'NMCM Hours',
      color: theme.palette.operational_readiness_status.nmcm,
    },
    {
      key: 'dadeHoursPercentage' as keyof DataPercentages,
      name: 'DADE Hours',
      color: theme.palette.operational_readiness_status.dade,
    },
  ];

  const plotData: Partial<PlotData>[] = categories.map((category) => ({
    x: dataPercentages.map((item) => dayjs(item.reportingMonth).format('DDMMMYY').toUpperCase()),
    y: dataPercentages.map((item) => item[category.key]),
    name: category.name,
    type: 'bar' as const,
    marker: {
      color: category.color,
    },
    width: 0.25,
    yaxis: 'y',
  }));

  // Add y2 line graph for unscheduled maintenance data
  if (unscheduledMaintenanceData?.length) {
    plotData.push({
      x: unscheduledMaintenanceData.map((item) => dayjs(item.date).format('DDMMMYY').toUpperCase()),
      y: unscheduledMaintenanceData.map((item) => item.unscheduled),
      name: 'Unscheduled',
      type: 'scatter' as const,
      mode: 'lines+markers',
      line: { color: theme.palette.primary.main },
      yaxis: 'y2',
    });
  }

  return (
    <BarGraphTemplate
      plotData={plotData}
      yLabel="Averages"
      height={450}
      barmode="stack"
      yAxisTickFormat=".0%"
      y2Label="Unscheduled Maintenance"
    />
  );
};

export default StatusOverTimeChart;
