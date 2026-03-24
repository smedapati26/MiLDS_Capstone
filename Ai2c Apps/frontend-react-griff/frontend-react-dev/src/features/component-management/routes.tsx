import { lazy } from 'react';
import { redirect, RouteObject } from 'react-router-dom';

const AnalyticsTab = lazy(() => import('./components/Analytics/AnalyticsTab'));
const PlanningTab = lazy(() => import('./components/Planning/PlanningTab'));

export const componentManagementRoutes: Array<RouteObject> = [
  { index: true, label: 'component-management-index', path: '', loader: () => redirect('analytics') },
  { label: 'Analytics', path: 'analytics', element: <AnalyticsTab /> },
  { label: 'Planning', path: 'planning', element: <PlanningTab /> },
];
