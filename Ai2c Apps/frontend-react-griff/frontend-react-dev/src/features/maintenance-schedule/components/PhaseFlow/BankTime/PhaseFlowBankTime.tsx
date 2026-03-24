import React, { useState } from 'react';

import { Stack, Typography } from '@mui/material';

import { PmxGauge } from '@components/PmxGauge';
import PmxGridItemTemplate from '@components/PmxGridItemTemplate';
import BankTimeTable from '@features/maintenance-schedule/components/PhaseFlow/BankTime/BankTimeTable';
import PhaseFlowToggle from '@features/maintenance-schedule/components/PhaseFlow/Component/PhaseFlowToggle';

import { IAircraftBankPercentage } from '@store/griffin_api/aircraft/models/IAircraft';
import { ReturnByType, useGetAircraftBankPercentageQuery } from '@store/griffin_api/aircraft/slices';
import { useAppSelector } from '@store/hooks';

import { usePhaseFlowContext } from '../PhaseFlowContext';

interface BankTimeVisualProps {
  returnBy: ReturnByType;
  data: IAircraftBankPercentage[] | undefined;
}

const BankTimeVisuals: React.FC<BankTimeVisualProps> = ({ data, returnBy }): JSX.Element => {
  if (returnBy === 'unit') {
    return (
      <PmxGauge
        showAs="percentage"
        value={data?.[0]?.bankPercentage as number}
        data-testid="phase-flow-unit-bank-time"
      />
    );
  }

  return <BankTimeTable data={data as IAircraftBankPercentage[]} />;
};

const PhaseFlowBankTime: React.FC = (): React.ReactElement => {
  const [toggleReturnBy, setToggleReturnBy] = useState<ReturnByType>('unit');
  const uic = useAppSelector((state) => state.appSettings.currentUic);

  const { data, isLoading, isError, isUninitialized } = useGetAircraftBankPercentageQuery([uic, toggleReturnBy], {
    skip: !uic,
  });
  const { selectedModels } = usePhaseFlowContext();

  return (
    <PmxGridItemTemplate
      label="Bank Time"
      isFetching={isLoading}
      isError={isError}
      isUninitialized={isUninitialized}
      sx={{ minHeight: 'auto' }}
    >
      <Stack data-testid="bank-time-component">
        <PhaseFlowToggle
          returnBy={toggleReturnBy}
          setReturnBy={setToggleReturnBy}
          abbreviated
          data-testid="bank-time-toggle"
          sx={{
            maxHeight: '30px',
          }}
        />
        {selectedModels.length > 0 ? (
          <BankTimeVisuals data={data} returnBy={toggleReturnBy} />
        ) : (
          <Typography data-testid="pf-empty-bank-time-message" sx={{ mt: 3 }} variant="body1">
            Select and aircraft and models to view the data.
          </Typography>
        )}
      </Stack>
    </PmxGridItemTemplate>
  );
};

export default PhaseFlowBankTime;
