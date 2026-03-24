import React, { useMemo, useState } from 'react';

import { Box, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';

import BarGraphTemplate from '@components/BarGraphTemplate';
import GraphLegendTemplate from '@components/GraphLegendTemplate';

import { IMissionsFlownDataSet } from '@store/griffin_api/readiness/models';
import { MissionTypesEnum } from '@store/griffin_api/readiness/models/MissionTypeEnum';

const MissionsFlownGraph: React.FC<{ data?: IMissionsFlownDataSet[] }> = ({ data }) => {
  const theme = useTheme();
  const [view, setView] = useState<'missions' | 'hours'>('missions');

  const categories = useMemo(
    () => data?.map((item) => MissionTypesEnum[item.mission_type as keyof typeof MissionTypesEnum]) || [],
    [data],
  );

  const plotData = useMemo(() => {
    if (!data) return [];

    const dayY = data.map((item) => (view === 'missions' ? item.day_mission_count : item.day_mission_hours));
    const nightY = data.map((item) => (view === 'missions' ? item.night_mission_count : item.night_mission_hours));

    return [
      {
        x: categories,
        y: dayY,
        type: 'bar' as const,
        name: 'Day Missions',
        marker: { color: theme.palette.graph?.purple },
        width: 0.15,
      },
      {
        x: categories,
        y: nightY,
        type: 'bar' as const,
        name: 'Night Missions',
        marker: { color: theme.palette.graph?.teal2 },
        width: 0.15,
      },
    ];
  }, [data, view, categories, theme.palette.graph]);

  const legendKey = [
    { label: 'Day Missions', color: theme.palette.graph?.purple },
    { label: 'Night Missions', color: theme.palette.graph?.teal2 },
  ];

  const handleViewChange = (newView: 'missions' | 'hours') => {
    setView(newView);
  };

  return (
    <>
      <Box component={'div'} width={450} mb={4}>
        <ToggleButtonGroup value={view} exclusive onChange={(_event, newValue) => handleViewChange(newValue)} fullWidth>
          <ToggleButton sx={{ padding: '8px 0', lineHeight: 'normal' }} value="missions">
            Amount Flown
          </ToggleButton>
          <ToggleButton sx={{ padding: '8px 0', lineHeight: 'normal' }} value="hours">
            Hours Flown
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <GraphLegendTemplate series={legendKey} />
      <BarGraphTemplate
        plotData={plotData}
        yLabel={`Number of ${view === 'missions' ? 'Missions' : 'Hours'} Flown`}
        height={390}
        barmode="group"
      />
    </>
  );
};

export default MissionsFlownGraph;
