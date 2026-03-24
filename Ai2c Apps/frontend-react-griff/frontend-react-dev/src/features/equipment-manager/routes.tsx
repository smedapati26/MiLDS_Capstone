import { lazy } from 'react';
import { redirect, RouteObject } from 'react-router-dom';

const AircraftTab = lazy(() => import('@features/equipment-manager/aircraft/AircraftTab'));
const AGSETab = lazy(() => import('@features/equipment-manager/agse/AGSETab'));
const UasTab = lazy(() => import('@features/equipment-manager/uas/UasTab'));

export const equipmentManagerRoutes: RouteObject[] = [];

// Conditional redirect logic for the index route
equipmentManagerRoutes.push({
  index: true,
  label: 'equipment-manager-index',
  path: '',
  loader: () => {
    if (import.meta.env.VITE_FF_EQUIPMENT_MANAGER_AIRCRAFT == 1) {
      return redirect('aircraft');
    } else {
      return redirect('/'); // fallback to save route
    }
  },
});

// Conditionally include routes
if (import.meta.env.VITE_FF_EQUIPMENT_MANAGER_AIRCRAFT == 1) {
  equipmentManagerRoutes.push({
    label: 'Aircraft',
    path: 'aircraft',
    element: <AircraftTab />,
  });
}

// Conditionally include routes
if (import.meta.env.VITE_FF_EQUIPMENT_MANAGER_UAS == 1) {
  equipmentManagerRoutes.push({
    label: 'UAS',
    path: 'uas',
    element: <UasTab />,
  });
}

if (import.meta.env.VITE_FF_EQUIPMENT_MANAGER_AGSE == 1) {
  equipmentManagerRoutes.push({
    label: 'AGSE',
    path: 'agse',
    element: <AGSETab />,
  });
}
