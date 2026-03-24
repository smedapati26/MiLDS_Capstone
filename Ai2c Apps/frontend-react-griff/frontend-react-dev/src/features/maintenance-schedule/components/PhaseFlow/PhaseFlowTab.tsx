import React from 'react';

import { PhaseFlowProvider } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';
import PhaseFlowTabContent from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowTabContent';

const PhaseFlowTab: React.FC = () => {
  return (
    <PhaseFlowProvider>
      <PhaseFlowTabContent />
    </PhaseFlowProvider>
  );
};

export default PhaseFlowTab;
