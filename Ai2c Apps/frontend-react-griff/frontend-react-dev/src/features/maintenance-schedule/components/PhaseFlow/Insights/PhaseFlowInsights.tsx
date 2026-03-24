import React from 'react';

import { Box, Stack, Typography } from '@mui/material';

import PmxGridItemTemplate from '@components/PmxGridItemTemplate';
import ClosePhaseInsight from '@features/maintenance-schedule/components/PhaseFlow/Insights/ClosePhaseInsight';
import CompanySamePhaseInsight from '@features/maintenance-schedule/components/PhaseFlow/Insights/CompanySamePhaseInsight';
import ScheduleConflictInsight from '@features/maintenance-schedule/components/PhaseFlow/Insights/ScheduleConflictInsight';
import { usePhaseFlowContext } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';
import { generateUniqueId } from '@utils/helpers/generateID-map-keys';

import { useGetAircraftCompanyQuery, useGetAircraftPhaseFlowByUicQuery } from '@store/griffin_api/aircraft/slices';
import { useAppSelector } from '@store/hooks';

/***
 * Returns the phase flow insights for the Units bar graph.
 */
const PhaseFlowInsights: React.FC = (): JSX.Element => {
  const uic = useAppSelector((state) => state.appSettings.currentUic);
  const { selectedModels, companyOption, getFamilyPhaseHours } = usePhaseFlowContext();

  const {
    data: unitData,
    isError,
    isLoading,
    isUninitialized,
  } = useGetAircraftPhaseFlowByUicQuery([uic, selectedModels], {
    skip: selectedModels.length <= 0,
  });

  const { data: companyData } = useGetAircraftCompanyQuery([uic, [], selectedModels], {
    skip: selectedModels.length <= 0,
  });

  const data = unitData?.filter((d) => {
    const opt = companyOption?.find((o) => o.uic === d.currentUnit);
    return opt?.selected;
  });

  // Maintenance that are close to phase
  const scheduleMaintenanceInsightData = data
    ?.filter((d) => d.hoursToPhase <= getFamilyPhaseHours() * 0.1)
    .map((item) => Object.fromEntries(Object.entries(item).filter(([key]) => ['serial', 'hoursToPhase'].includes(key))))
    .sort((a, b) => a.hoursToPhase - b.hoursToPhase);

  // serials that are 5 hours apart and next to each other
  const sameCompanyAircraftData: string[][] = [];
  const closestData = data
    ?.map((item, index, arr) => {
      if (index < arr.length - 1 && Math.abs(item.hoursToPhase - arr[index + 1].hoursToPhase) <= 5) {
        // Aircraft models that are going into phase at the same time.
        if (item.currentUnit === arr[index + 1].currentUnit) {
          const comp = companyData?.find((o) => o.uic === item.currentUnit);
          if (comp) {
            sameCompanyAircraftData.push([comp.shortName, item.serial, arr[index + 1].serial]);
          }
        }

        return [item.serial, arr[index + 1].serial];
      }
    })
    .filter((pair) => pair != undefined);

  return (
    <PmxGridItemTemplate
      label="Insights"
      isFetching={isLoading}
      isError={isError}
      isUninitialized={selectedModels.length > 0 ? isUninitialized : false}
      sx={{ height: '100%', minHeight: 'auto', display: 'flex', flexDirection: 'column' }}
    >
      <Box data-testid="phase-flow-insight-section" sx={{ position: 'relative', flex: 1, height: '100%' }}>
        <Box sx={{ position: 'absolute', inset: 0, overflow: 'auto' }}>
          {selectedModels.length > 0 ? (
            <Stack>
              {scheduleMaintenanceInsightData?.map((item) => (
                <ScheduleConflictInsight
                  key={`schedule-maintenance-conflicts-${generateUniqueId()}`}
                  serial={item.serial}
                  hoursToPhase={item.hoursToPhase}
                />
              ))}
              {closestData?.map((item) => (
                <ClosePhaseInsight key={`close-to-phase-${generateUniqueId()}`} serial1={item![0]} serial2={item![1]} />
              ))}
              {sameCompanyAircraftData?.map((item) => (
                <CompanySamePhaseInsight
                  key={`same-company-aircraft-${generateUniqueId()}`}
                  company={item[0]}
                  serial1={item[1]}
                  serial2={item[2]}
                />
              ))}
            </Stack>
          ) : (
            <Typography data-testid="pf-empty-insight-message" variant="body1">
              Select and aircraft and models to view the data.
            </Typography>
          )}
        </Box>
      </Box>
    </PmxGridItemTemplate>
  );
};

export default PhaseFlowInsights;
