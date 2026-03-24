import { TabsLayout } from '@ai2c/pmx-mui';

import { DsrLastUpdated } from './components/DsrLastUpdated';
import ExportReports from './components/ExportReports/ExportReport';

import { dailyStatusReportRoutes } from './routes';

/**
 * DSRLayout Functional Component
 */
export const DSRTabLayout: React.FC = () => {
  return (
    <TabsLayout title="Daily Status Report" routes={dailyStatusReportRoutes}>
      <DsrLastUpdated />
      <ExportReports />
    </TabsLayout>
  );
};
