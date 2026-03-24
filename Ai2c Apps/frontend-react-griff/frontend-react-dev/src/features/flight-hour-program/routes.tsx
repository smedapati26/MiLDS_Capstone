import { lazy } from 'react';
import { redirect, RouteObject } from 'react-router-dom';

const OverviewTab = lazy(() => import('@features/flight-hour-program/overview/OverviewTab'));
// const CalculatorTab = lazy(() => import('@features/flight-hour-program/calculator/CalculatorTab'));
// const SavedCOAsTab = lazy(() => import('@features/flight-hour-program/saved-coas/SavedCOAsTab'));

// Conditional redirect logic for the index routes
export const flightHourProgramRoutes: RouteObject[] = [];

flightHourProgramRoutes.push({
  index: true,
  label: 'flight-hour-program-index',
  path: '',
  loader: () => {
    if (import.meta.env.VITE_FF_FLIGHT_HOUR_PROGRAM_OVERVIEW == 1) {
      return redirect('overview');
    } else {
      return redirect('/');
    }
  },
});

// conditionally include routes
if (import.meta.env.VITE_FF_FLIGHT_HOUR_PROGRAM_OVERVIEW == 1) {
  flightHourProgramRoutes.push({
    label: 'Overview',
    path: 'overview',
    element: <OverviewTab />,
  });
}

// TODO:Removed but kept for after MVP
// if (import.meta.env.VITE_FF_FLIGHT_HOUR_PROGRAM_CALCULATOR == 1) {
//   flightHourProgramRoutes.push({
//     label: 'Calculator',
//     path: 'calculator',
//     element: <CalculatorTab />,
//   });
// }

// if (import.meta.env.VITE_FF_FLIGHT_HOUR_PROGRAM_SAVED_COAS == 1) {
//   flightHourProgramRoutes.push({
//     label: 'Saved COAs',
//     path: 'saved-coas',
//     element: <SavedCOAsTab />,
//   });
// }
