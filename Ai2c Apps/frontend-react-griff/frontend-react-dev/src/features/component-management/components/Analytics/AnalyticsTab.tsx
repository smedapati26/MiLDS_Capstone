import React, { lazy, useState } from 'react';

import { Stack } from '@mui/material';

import { PmxToggleButtonGroup } from '@components/inputs';

const AnalyticsUnitView = lazy(() => import('./AnalyticsUnitView'));
const AnalyticsAircraftView = lazy(() => import('./AnalyticsAircraftView'));
const AnalyticsComponentView = lazy(() => import('./AnalyticsComponentView'));

type TabTypes = 'unit' | 'aircraft' | 'component';

const AnalyticsTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabTypes>('unit');

  return (
    <Stack direction="column" gap={3}>
      <PmxToggleButtonGroup
        value={activeTab}
        onChange={(value) => setActiveTab(value as TabTypes)}
        options={['unit', 'aircraft', 'component']}
      />
      {activeTab === 'unit' ? <AnalyticsUnitView /> : null}
      {activeTab === 'aircraft' ? <AnalyticsAircraftView /> : null}
      {activeTab === 'component' ? <AnalyticsComponentView /> : null}
    </Stack>
  );
};

export default AnalyticsTab;
