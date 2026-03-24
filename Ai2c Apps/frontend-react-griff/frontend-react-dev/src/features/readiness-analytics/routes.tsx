import { lazy } from 'react';
import { redirect, RouteObject } from 'react-router-dom';

const EquipmentTab = lazy(() => import('./Equipment/EquipmentTab'));
// const PersonnelTab = lazy(() => import('./Personnel/PersonnelTab'));
const TrainingTab = lazy(() => import('./Training/TrainingTab'));

export const readinessAnalyticsRoutes: Array<RouteObject> = [
  { index: true, label: 'readiness-analytics-index', path: '', loader: () => redirect('equipment') },
  { label: 'Equipment', path: 'equipment', element: <EquipmentTab /> },
  { label: 'Training', path: 'training', element: <TrainingTab /> },
  // { label: 'Personnel', path: 'personnel', element: <PersonnelTab /> }, removing for MVP release.
];
