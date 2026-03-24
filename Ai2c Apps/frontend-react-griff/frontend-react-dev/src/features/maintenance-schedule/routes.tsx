import { lazy } from 'react';
import { redirect, RouteObject } from 'react-router-dom';

const MaintenanceCalendarTab = lazy(() => import('@features/maintenance-schedule/components/Calendar/CalendarTab'));
const PhaseFlowTab = lazy(() => import('@features/maintenance-schedule/components/PhaseFlow/PhaseFlowTab'));

export const maintenanceScheduleRoutes: Array<RouteObject> = [
  { index: true, label: 'maintenance-calendar-index', path: '', loader: () => redirect('calendar') },
  { label: 'Calendar', path: 'calendar', element: <MaintenanceCalendarTab /> },
  { label: 'Phase Flow', path: 'phaseFlow', element: <PhaseFlowTab /> },
];
