import { createHashRouter, redirect, RouteObject } from 'react-router-dom';

import ChecklistIcon from '@mui/icons-material/Checklist';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FolderIcon from '@mui/icons-material/Folder';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import PeopleIcon from '@mui/icons-material/People';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { Badge } from '@mui/material';

import { ErrorBoundary } from '@ai2c/pmx-mui';

// Feature Components and Routes
import AMTPMain from '@features/amtp-packet/components/AMTPMain';
import { amtpPacketRoutes } from '@features/amtp-packet/routes';
import { SoldierManagerMain } from '@features/soldier-manager';
import { soldierManagerRoutes } from '@features/soldier-manager/routes';
import { SupportCenterPage } from '@features/support-center';
import { TaskExplorerPage } from '@features/task-explorer';
import { ToolsPage } from '@features/tools';
import { UCTLManagerPage } from '@features/uctl-manager';
import UnitHealthMain from '@features/unit-health/components/UnitHealthMain';
import { unitHealthRoutes } from '@features/unit-health/routes';
// Page Level Components
import AccountProfile from '@pages/AccountProfile';
import CreateAccount from '@pages/CreateAccount';
import Oops from '@pages/Oops';

import { authLoader } from './loaders/authLoader';

import App from './App';

/**
 * Routes
 *
 * @important Routes must be set up the way for @see MainNavDrawer
 * @see MainNavDrawer routes are looped through to create NavLink's for navigation
 */
export const routes = (isManager: boolean): Array<RouteObject> => {
  let baseRoutes: Array<RouteObject> = [
    { index: true, label: 'index', path: '', loader: () => redirect('amtp-packet') }, // Redirects to update Browser URL correctly
    {
      label: 'AMTP Packet',
      path: 'amtp-packet',
      icon: <FolderIcon />,
      children: amtpPacketRoutes,
      element: <AMTPMain />,
    },
    {
      label: 'Unit Health',
      path: 'unit-health',
      icon: <FitnessCenterIcon />,
      children: unitHealthRoutes,
      element: <UnitHealthMain />,
    },
    {
      label: 'Task Explorer',
      path: 'task-explorer',
      icon: <ManageSearchIcon />,
      element: <TaskExplorerPage />,
      errorElement: <Oops />,
    },
  ];

  if (isManager) {
    baseRoutes = [
      ...baseRoutes,
      {
        label: 'UCTL Manager',
        path: 'uctl-manager',
        icon: <ChecklistIcon />,
        element: <UCTLManagerPage />,
        errorElement: <Oops />,
      },
    ];
  }

  baseRoutes = [
    ...baseRoutes,
    {
      index: true,
      label: 'Account Management',
      path: 'profile',
      element: <AccountProfile />,
      errorElement: <Oops />,
    },
  ];

  return baseRoutes;
};

export const bottomRoutes = (hasRequests: boolean, isManager: boolean) => {
  let baseRoutes: Array<RouteObject> = [];

  if (isManager) {
    baseRoutes = [
      ...baseRoutes,
      {
        label: 'Soldier Manager',
        path: 'soldier-manager',
        icon: hasRequests ? (
          <Badge variant="dot" color="error">
            <PeopleIcon />
          </Badge>
        ) : (
          <PeopleIcon />
        ),
        children: soldierManagerRoutes(),
        element: <SoldierManagerMain />,
      },
    ];
  }

  baseRoutes = [
    ...baseRoutes,

    {
      label: 'Support Center',
      path: 'support-center',
      icon: <SupportAgentIcon />,
      element: <SupportCenterPage />,
    },
    {
      label: 'Tools',
      path: 'tools',
      icon: <HomeRepairServiceIcon />,
      element: <ToolsPage />,
    },
  ];

  return baseRoutes;
};

/**
 * Router
 *
 * App is the root Component
 *
 * @important Routes must be set up the way for @see MainNavDrawer
 * @see MainLayout component for react-router-dom <Outlet/> component where children routes render
 * @see MainNavDrawer for children routes to be NavLink items
 * @see authLoader for simulated authentication *Optional*
 */
export const router = createHashRouter([
  {
    path: '/',
    label: 'app-root',
    element: <App />,
    loader: authLoader,
    errorElement: <ErrorBoundary />,
    children: [...routes(true), ...bottomRoutes(true, true)],
  },
  {
    label: 'Create Account',
    path: 'create-account',
    element: <CreateAccount />,
    errorElement: <Oops />,
  },
]);
