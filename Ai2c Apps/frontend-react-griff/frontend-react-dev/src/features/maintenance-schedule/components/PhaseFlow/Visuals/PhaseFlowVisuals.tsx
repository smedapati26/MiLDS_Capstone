import React, { useState } from 'react';

import { Box, Stack } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';

import PmxGridItemTemplate from '@components/PmxGridItemTemplate';
import PhaseFlowToggle from '@features/maintenance-schedule/components/PhaseFlow/Component/PhaseFlowToggle';
import { usePhaseFlowContext } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';
import PhaseFlowActions from '@features/maintenance-schedule/components/PhaseFlow/Visuals/Action/PhaseFlowActions';
import PhaseFlowBarChart from '@features/maintenance-schedule/components/PhaseFlow/Visuals/PhaseFlowBarChart';
import PhaseFlowLowerVisuals from '@features/maintenance-schedule/components/PhaseFlow/Visuals/PhaseFlowLowerVisuals';

import { IAircraftPhaseFlow } from '@store/griffin_api/aircraft/models/IAircraft';
import {
  ReturnByType,
  useGetAircraftCompanyQuery,
  useGetAircraftPhaseFlowByUicQuery,
} from '@store/griffin_api/aircraft/slices';
import { useAppSelector } from '@store/hooks';

const PhaseFlowVisuals: React.FC = () => {
  const [toggleReturnBy, setToggleReturnBy] = useState<ReturnByType>('subordinates');
  const { selectedModels } = usePhaseFlowContext();
  const uic = useAppSelector((state) => state.appSettings.currentUic);

  const emptyModels = selectedModels.length <= 0;
  const {
    data: fetchedUnitData,
    isError,
    isLoading,
    isUninitialized,
  } = useGetAircraftPhaseFlowByUicQuery(emptyModels ? skipToken : [uic, selectedModels]);
  const { data: fetchedCompanyInfo } = useGetAircraftCompanyQuery(emptyModels ? skipToken : [uic, [], selectedModels]);

  const unitData = emptyModels ? [] : fetchedUnitData;
  const companyInfo = emptyModels ? [] : fetchedCompanyInfo;

  return (
    <PmxGridItemTemplate
      label="Phase Flow"
      isFetching={isLoading}
      isError={isError}
      isUninitialized={selectedModels.length > 0 ? isUninitialized : false}
    >
      <Stack spacing={3}>
        <Stack direction="row" sx={{ width: '100%' }} spacing={3}>
          <Box sx={{ width: '75%' }}>
            <PhaseFlowBarChart
              data={unitData as IAircraftPhaseFlow[]}
              companyInfo={companyInfo}
              title="Unit Phase Flow"
            />
          </Box>
          <Box sx={{ width: '25%' }}>
            <PhaseFlowActions />
          </Box>
        </Stack>

        <PhaseFlowToggle
          setReturnBy={setToggleReturnBy}
          data-testid="pf-lower-visuals-toggle"
          returnBy={toggleReturnBy}
          sx={{ maxHeight: '30px' }}
        />
        <PhaseFlowLowerVisuals toggleReturnBy={toggleReturnBy} />
      </Stack>
    </PmxGridItemTemplate>
  );
};

export default PhaseFlowVisuals;
