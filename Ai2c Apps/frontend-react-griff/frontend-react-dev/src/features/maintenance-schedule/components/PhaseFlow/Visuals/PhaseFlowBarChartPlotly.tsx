import React, { ReactElement, useMemo } from 'react';
import { Layout } from 'plotly.js';
import Plot from 'react-plotly.js';

import { alpha, Card, Stack, Typography, useTheme } from '@mui/material';

import { slugify } from '@ai2c/pmx-mui';

import { usePhaseFlowContext } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';
import LegendHover from '@features/maintenance-schedule/components/PhaseFlow/Visuals/LegendHover';

import { IAircraftCompany, IAircraftPhaseFlow } from '@store/griffin_api/aircraft/models/IAircraft';

const AircraftFamilyPhaseHours: { [key: string]: number } = {
  'BLACK HAWK': 480,
  CHINOOK: 640,
  APACHE: 500,
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
}): ReactElement => {
  const theme = useTheme();
  const { chinookPhase, selectedFamily, companyOption } = usePhaseFlowContext();
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

    return {
      phaseData: dataSeries,
      aircraftSerials: aircraftSerials,
      uicColor: uicColor,
      borderColor: borderColor,
    };
  }, [chinookPhase, companyOption, filteredData, selectedFamily]);

  const layout: Partial<Layout> = {
    colorway: theme?.palette?.graph ? Object.values(theme?.palette?.graph) : undefined,
    font: {
      color: theme.palette.text.primary,
      family: theme.typography.fontFamily,
      size: 12,
    },
    showlegend: false,
    shapes: [
      {
        type: 'line',
        xref: 'paper',
        x0: 0,
        x1: 1,
        yref: 'y',
        y0: AircraftFamilyPhaseHours[selectedFamily[0]],
        y1: 0,
        line: {
          dash: 'dash',
          width: 1,
          color: modeColor,
        },
      },
    ],
    xaxis: {
      type: 'category',
      tickangle: -90,
      visible: true,
      showgrid: false,
      showline: true,
      linewidth: 1,
      linecolor: modeColor,
      showspikes: true,
      showticklabels: true,
      // tickmode: 'auto',
      zeroline: true,
      zerolinewidth: 1,
      zerolinecolor: modeColor,
      tickfont: {
        color: theme.palette.text.primary,
        family: theme.typography.fontFamily,
      },
    },
    yaxis: {
      dtick: selectedFamily[0] === 'APACHE' ? 100 : 120,
      range: [0, AircraftFamilyPhaseHours[selectedFamily[0]]],
      autorange: false,
      tick0: 0,
      visible: true,
      showline: true,
      linewidth: 1,
      linecolor: modeColor,
      tickmode: 'array',
      showgrid: false,
      showticklabels: true,
      zeroline: false,
      zerolinewidth: 1,
      zerolinecolor: modeColor,
      tickfont: {
        color: theme.palette.text.primary,
        family: theme.typography.fontFamily,
      },
      title: {
        font: {
          color: theme.palette.text.primary,
          family: theme.typography.fontFamily,
          size: 14,
        },
        text: 'Hours to Phase',
      },
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    margin: {
      b: 76,
      l: 72,
      r: 16,
      t: 12,
    },
  };

  return (
    <Card
      data-testid={`${title && slugify(title)}-pf-bar-chart-container`}
      style={{ border: 'none', boxShadow: 'none' }}
      data-serials-count={aircraftSerials.length} // this is to test number of bars functionality
    >
      <Stack sx={{ mt: 5, ml: 4, pr: 4 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          {!isMain && <LegendHover companyInfo={companyInfo} />}
        </Stack>
        <Plot
          data={[
            {
              x: aircraftSerials,
              y: phaseData,
              type: 'bar',
              marker: { color: uicColor, line: { color: borderColor, width: 2 } },
            },
          ]}
          layout={layout}
          config={{
            responsive: true,
            displayModeBar: false,
            staticPlot: true,
          }}
          useResizeHandler={true}
          data-testid="unit-phase-flow-chart"
        />
      </Stack>
    </Card>
  );
};

export default PhaseFlowBarChart;
