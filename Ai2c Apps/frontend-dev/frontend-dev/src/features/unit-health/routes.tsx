import { lazy } from 'react';
import { redirect, RouteObject } from 'react-router-dom';

const DashboardTab = lazy(() => import('./components/tabs/DashboardTab'));
const RosterTab = lazy(() => import('./components/tabs/RosterTab'));
const ReportsTab = lazy(() => import('./components/tabs/ReportsTab'));

export const unitHealthRoutes: Array<RouteObject> = [
  { index: true, label: 'unit-health-index', path: '', loader: () => redirect('dashboard') },
  { label: 'Dashboard', path: 'dashboard', element: <DashboardTab /> },
  { label: 'Roster', path: 'roster', element: <RosterTab /> },
  { label: 'Reports', path: 'reports', element: <ReportsTab /> },
];
