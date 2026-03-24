import React from 'react';

import { Box } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';

import { usePhaseFlowContext } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';
import PhaseFlowCarousel from '@features/maintenance-schedule/components/PhaseFlow/Visuals/PhaseFlowCarousel';
import UnitLowerVisual from '@features/maintenance-schedule/components/PhaseFlow/Visuals/UnitLowerVisual';

import { IAircraftPhaseFlowModels, IAircraftPhaseFlowSubordinates } from '@store/griffin_api/aircraft/models/IAircraft';
import {
  ReturnByType,
  useGetAircraftCompanyQuery,
  useGetAircraftPhaseFlowModelsQuery,
  useGetAircraftPhaseFlowSubordinatesQuery,
} from '@store/griffin_api/aircraft/slices';
import { useAppSelector } from '@store/hooks';

const PhaseFlowLowerVisuals: React.FC<{ toggleReturnBy: ReturnByType }> = ({ toggleReturnBy }): JSX.Element => {
  const { selectedModels } = usePhaseFlowContext();
  const uic = useAppSelector((state) => state.appSettings.currentUic);
  const emptyModels = selectedModels.length <= 0;

  const { data: fetchedSubData, isLoading: loadingSubs } = useGetAircraftPhaseFlowSubordinatesQuery(
    emptyModels ? skipToken : [uic, selectedModels],
  );
  const { data: fetchedModData, isLoading: loadingMod } = useGetAircraftPhaseFlowModelsQuery(
    emptyModels ? skipToken : [uic, selectedModels],
  );

  const subData = emptyModels ? [] : fetchedSubData?.filter((item) => item.aircraft?.length > 0);
  const modData = emptyModels ? [] : fetchedModData?.filter((item) => item.aircraft?.length > 0);

  const { data: companyInfo } = useGetAircraftCompanyQuery([uic, [], selectedModels], {
    skip: selectedModels.length <= 0,
  });

  return (
    <Box>
      {(() => {
        switch (toggleReturnBy) {
          case 'unit':
            return <UnitLowerVisual />;
          case 'subordinates':
            return (
              <PhaseFlowCarousel
                data={subData as IAircraftPhaseFlowSubordinates[]}
                companyInfo={companyInfo}
                isLoading={loadingSubs}
              />
            );
          case 'model':
            return (
              <PhaseFlowCarousel
                data={modData as IAircraftPhaseFlowModels[]}
                companyInfo={companyInfo}
                isLoading={loadingMod}
              />
            );
        }
      })()}
    </Box>
  );
};

export default PhaseFlowLowerVisuals;
