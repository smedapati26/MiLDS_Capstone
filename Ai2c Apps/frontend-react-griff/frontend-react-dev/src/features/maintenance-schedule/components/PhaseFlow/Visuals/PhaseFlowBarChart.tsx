import React, { useMemo } from 'react';
import { ChartOptions } from 'chart.js';
import { Chart } from 'react-chartjs-2';

import { alpha, Card, Stack, Typography, useTheme } from '@mui/material';

import { slugify } from '@ai2c/pmx-mui';

import { usePhaseFlowContext } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';

import { IAircraftCompany, IAircraftPhaseFlow } from '@store/griffin_api/aircraft/models/IAircraft';

import LegendHover from './LegendHover';

const AircraftTickStep: { [key: string]: number } = {
  'BLACK HAWK': 120,
  CHINOOK: 160,
  APACHE: 100,
};

interface UnitPhaseFlowChartProps {
  data: IAircraftPhaseFlow[];
  companyInfo: IAircraftCompany[] | undefined;
  title?: string;
  isMain?: boolean;
}

const GetColor = ({
  family,
  phase,
  color,
  chinookPhase,
}: {
  family: string;
  phase: IAircraftPhaseFlow;
  color: string;
  chinookPhase: string;
}): string => {
  switch (family) {
    case 'BLACK HAWK':
      return phase.nextPhaseType === 'PMI1' ? color : alpha(color, 0.25);
    case 'CHINOOK':
      return phase.nextPhaseType === 'C4' && chinookPhase != '320' ? alpha(color, 0.25) : color;
    default:
      return color;
  }
};

const PhaseFlowBarChart: React.FC<UnitPhaseFlowChartProps> = ({
  data,
  companyInfo,
  title,
  isMain = true,
}): React.ReactElement => {
  const theme = useTheme();
  const { chinookPhase, selectedFamily, companyOption, getFamilyPhaseHours } = usePhaseFlowContext();
  const isDarkMode = theme.palette.mode === 'dark';
  const modeColor = isDarkMode ? theme.palette.common.white : theme.palette.common.black;

  const filteredData = isMain
    ? data?.filter((d) => {
        const opt = companyOption?.find((o) => o.uic === d.currentUnit);
        return opt?.selected;
      })
    : data;

  const { phaseData, aircraftSerials, uicColor, borderColor } = useMemo(() => {
    const dataSeries = [] as number[];
    const aircraftSerials = [] as string[];
    const uicColor = [] as string[];
    const borderColor = [] as string[];

    filteredData?.map((phase: IAircraftPhaseFlow) => {
      dataSeries.push(
        selectedFamily[0] === 'CHINOOK' && chinookPhase === '320' ? phase.hoursTo320 : phase.hoursToPhase,
      );
      aircraftSerials.push(String(phase.serial));

      const opt = companyOption?.find((o) => o.uic === phase.currentUnit);

      uicColor.push(
        opt ? GetColor({ family: selectedFamily[0], phase: phase, color: opt.color, chinookPhase }) : '#bbbbb',
      );
      borderColor.push(opt ? opt.color : '#bbbbb');
    });

    // sorting chinook 320
    if (selectedFamily[0] === 'CHINOOK' && chinookPhase === '320') {
      dataSeries.sort((a, b) => b - a);
    }

    return {
      phaseData: dataSeries,
      aircraftSerials: aircraftSerials,
      uicColor: uicColor,
      borderColor: borderColor,
    };
  }, [chinookPhase, companyOption, filteredData, selectedFamily]);

  const chartData = {
    labels: aircraftSerials,
    datasets: [
      {
        label: 'Serials',
        data: phaseData,
        backgroundColor: uicColor,
        borderColor: borderColor,
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'bar'> = useMemo(
    () => ({
      responsive: true,
      scales: {
        x: {
          border: {
            display: true,
            color: modeColor,
            width: 1,
          },
          beginAtZero: true,
          grid: {
            display: false,
          },
          ticks: {
            maxRotation: 90,
            minRotation: 90,
            color: theme.palette.text.primary,
          },
        },
        y: {
          border: {
            display: true,
            color: modeColor,
            width: 1,
          },
          title: {
            display: true,
            text: 'Hours to Phase',
            color: theme.palette.text.primary,
            font: {
              size: 14,
              family: theme.typography.fontFamily,
            },
          },
          grid: {
            display: false,
          },
          beginAtZero: true,
          max: getFamilyPhaseHours(),
          min: 0,
          ticks: {
            stepSize: AircraftTickStep[selectedFamily[0]],
            color: theme.palette.text.primary,
          },
        },
      },
      plugins: {
        annotation: {
          annotations: {
            diagonal: {
              type: 'line',
              xScaleID: 'x',
              yScaleID: 'y',
              xMin: -0.5, // to touch the axis
              xMax: aircraftSerials.length <= 0 ? 0.5 : aircraftSerials.length - 0.5,
              yMin: getFamilyPhaseHours(),
              yMax: 0,
              borderColor: modeColor,
              borderDash: [6, 6],
              borderWidth: 2,
            },
          },
        },
      },
    }),
    [
      aircraftSerials.length,
      getFamilyPhaseHours,
      modeColor,
      selectedFamily,
      theme.palette.text.primary,
      theme.typography.fontFamily,
    ],
  );

  return (
    <Card
      data-testid={`${title && slugify(title)}-pf-bar-chart-container`}
      sx={{ border: 'none', boxShadow: 'none', height: '100%' }}
      data-serials-count={aircraftSerials.length} // this is to test number of bars functionality
    >
      <Stack sx={{ p: 4, width: '100%', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6">{title}</Typography>
          {!isMain && <LegendHover companyInfo={companyInfo} />}
        </Stack>
        <Chart
          key={`${title}-${JSON.stringify(data)}`}
          type="bar"
          data={chartData}
          options={options}
          style={{ width: '100%', height: '100%' }}
        />
      </Stack>
    </Card>
  );
};

export default PhaseFlowBarChart;
