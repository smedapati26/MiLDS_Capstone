import React from 'react';
import dayjs from 'dayjs';

import { TabsLayout } from '@ai2c/pmx-mui';

import { LastUpdated } from '@components/data-tables';
import { flightHourProgramRoutes } from '@features/flight-hour-program/routes';
import { IOptions } from '@models/IOptions';

const FlightHourProgramTabLayout: React.FC = (): React.ReactNode => {
  const latestUpdates: Array<IOptions> = [
    {
      label: 'Latest Sync:',
      value: dayjs().format('MM/DD/YYYY HH:mm:ss'),
    },
    {
      label: 'Latest Connect:',
      value: dayjs().format('MM/DD/YYYY HH:mm:ss'),
    },
    {
      label: 'Latest Export:',
      value: dayjs().format('MM/DD/YYYY HH:mm:ss'),
    },
    {
      label: 'Latest Manual:',
      value: dayjs().format('MM/DD/YYYY HH:mm:ss'),
    },
  ];

  return (
    <TabsLayout title="Flight Hour Program" routes={flightHourProgramRoutes}>
      <LastUpdated lastUpdateDate={dayjs()} extraUpdates={latestUpdates} />
    </TabsLayout>
  );
};

export default FlightHourProgramTabLayout;
