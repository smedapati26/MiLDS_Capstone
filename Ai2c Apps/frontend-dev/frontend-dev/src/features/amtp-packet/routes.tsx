import { lazy } from 'react';
import { redirect, RouteObject } from 'react-router-dom';

const CriticalTaskListTab = lazy(() => import('./components/tabs/CriticalTaskListTab'));
const MaintainerRecordTab = lazy(() => import('./components/tabs/MaintainerRecordTab'));
const CounselingsTab = lazy(() => import('./components/tabs/CounselingsTab'));
const SupportingDocumentsTab = lazy(() => import('./components/tabs/SupportingDocumentsTab'));
const AvailabilityFlagsTab = lazy(() => import('./components/tabs/AvailabilityFlagsTab'));
const FaultRecordsTab = lazy(() => import('./components/tabs/FaultRecordsTab'));

export const amtpPacketRoutes: Array<RouteObject> = [
  { index: true, label: 'amtp-packet-index', path: '', loader: () => redirect('critical-task-list') },
  { label: 'Critical Task List', path: 'critical-task-list', element: <CriticalTaskListTab /> },
  { label: 'Maintainer Record', path: 'maintainer-record', element: <MaintainerRecordTab /> },
  { label: 'Counselings', path: 'counselings', element: <CounselingsTab /> },
  { label: 'Supporting Documents', path: 'supporting-documents', element: <SupportingDocumentsTab /> },
  { label: 'Availability Flags', path: 'availability-flags', element: <AvailabilityFlagsTab /> },
  { label: 'Fault Records', path: 'fault-records', element: <FaultRecordsTab /> },
];
