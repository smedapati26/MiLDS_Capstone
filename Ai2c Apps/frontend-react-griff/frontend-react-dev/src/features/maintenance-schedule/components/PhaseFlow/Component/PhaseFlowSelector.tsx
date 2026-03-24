import React, { useRef } from 'react';

import { Box } from '@mui/material';

import { AircraftDropdown } from '@components/dropdowns';
import {
  PhaseFamilies,
  usePhaseFlowContext,
} from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';

const PhaseFlowSelector: React.FC = () => {
  const { selectedFamily, setSelectedFamily, selectedModels, setSelectedModels } = usePhaseFlowContext();

  const pmxMultiRef = useRef<{ clearSelectAll: () => void }>(null);

  const handleFamilyChange = (families: PhaseFamilies[]): void => {
    setSelectedFamily(families);
    setSelectedModels([]);
    pmxMultiRef.current?.clearSelectAll();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
      <AircraftDropdown
        selected={selectedFamily}
        handleSelect={handleFamilyChange as (x: string[]) => void}
        aircraftType="aircraftFamily"
        label="Aircraft*"
        multiSelect={false}
      />
      <AircraftDropdown
        selected={selectedModels}
        handleSelect={setSelectedModels}
        aircraftType="aircraftModel"
        label="Model(s)*"
        filterValues={selectedFamily}
        disabled={selectedFamily.length <= 0}
        ref={pmxMultiRef}
      />
    </Box>
  );
};

export default PhaseFlowSelector;
