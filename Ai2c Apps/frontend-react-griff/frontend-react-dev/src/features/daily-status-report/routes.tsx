import { lazy } from 'react';
import { redirect, RouteObject } from 'react-router-dom';

const Unit = lazy(() => import('@features/daily-status-report/pages/Unit'));
const Subordinates = lazy(() => import('@features/daily-status-report/pages/Subordinates'));

export const dailyStatusReportRoutes: Array<RouteObject> = [
  { index: true, label: 'daily-status-report-index', path: '', loader: () => redirect('unit') },
  { label: 'Unit', path: 'unit', element: <Unit /> },
  { label: 'Subordinates', path: 'subordinates', element: <Subordinates /> },
];
