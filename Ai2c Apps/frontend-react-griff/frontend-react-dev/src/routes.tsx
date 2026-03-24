import { createHashRouter, redirect, RouteObject } from 'react-router-dom';

import { ConnectingAirports } from '@mui/icons-material';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ConstructionIcon from '@mui/icons-material/Construction';
import GroupsIcon from '@mui/icons-material/Groups';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SpeedIcon from '@mui/icons-material/Speed';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

import { TabsLayout } from '@ai2c/pmx-mui/components';

import AdminRoute from '@components/utils/AdminRoute';
import { componentManagementRoutes } from '@features/component-management/routes';
import { DSRTabLayout } from '@features/daily-status-report/DSRTabLayout';
import { dailyStatusReportRoutes } from '@features/daily-status-report/routes';
import { EquipmentManagerProvider } from '@features/equipment-manager/EquipmentManagerContext';
import { equipmentManagerRoutes } from '@features/equipment-manager/routes';
import TabsLayoutWrapper from '@features/equipment-manager/TabsLayoutWrapper';
import { equipmentTransferRoutes, EquipmentTransferTabsLayout } from '@features/equipment-transfer/routes';
import FlightHourProgramTabLayout from '@features/flight-hour-program/FlightHourProgramTabLayout';
import { flightHourProgramRoutes } from '@features/flight-hour-program/routes';
import { maintenanceScheduleRoutes } from '@features/maintenance-schedule/routes';
import { readinessAnalyticsRoutes } from '@features/readiness-analytics/routes';
import { SupportCenterPage } from '@features/support-center';
import { taskForcesRoutes } from '@features/task-forces/routes';
import AccountManagement from '@features/user-management/components/AccountManagement';
import {
  userManagementRoutes,
  UserManagementTabsLayout,
} from '@features/user-management/components/UserManagement/routes';
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

export const routes = get_routes();

function get_routes(): Array<RouteObject> {
  const indexRoute = import.meta.env.VITE_FF_INDEX_ROUTE || 'equipment-manager';
  const routes: Array<RouteObject> = [{ index: true, label: 'index', path: '', loader: () => redirect(indexRoute) }];

  routes.push(
    {
      label: 'Equipment Manager',
      path: 'equipment-manager',
      icon: <AirplanemodeActiveIcon />,
      children: equipmentManagerRoutes,
      element: (
        <div id="equipment-manager-container">
          <EquipmentManagerProvider>
            <TabsLayoutWrapper title="Equipment Manager" routes={equipmentManagerRoutes} />
          </EquipmentManagerProvider>
        </div>
      ),
    },
    {
      label: 'Daily Status Report',
      path: 'daily-status-report',
      icon: <QueryStatsIcon />,
      children: dailyStatusReportRoutes,
      element: <DSRTabLayout />,
      errorElement: <Oops />,
    },
    {
      label: 'Maintenance Schedule',
      path: 'maintenance-schedule',
      icon: <CalendarTodayIcon />,
      children: maintenanceScheduleRoutes,
      element: (
        <div id="maintenance-scheduler-container">
          <TabsLayout title="Maintenance Schedule" routes={maintenanceScheduleRoutes} />
        </div>
      ),
      errorElement: <Oops />,
    },
    {
      label: 'Component Management',
      path: 'component-management',
      icon: <ConstructionIcon />,
      children: componentManagementRoutes,
      element: (
        <div id="component-management-container">
          <TabsLayout title="Component Management" routes={componentManagementRoutes} />
        </div>
      ),
      errorElement: <Oops />,
    },
    {
      label: 'Readiness Analytics',
      path: 'readiness-analytics',
      icon: <SpeedIcon />,
      children: readinessAnalyticsRoutes,
      element: <TabsLayout title="Readiness Analytics" routes={readinessAnalyticsRoutes} />,
      errorElement: <Oops />,
    },
    {
      label: 'Flight Hour Program',
      path: 'flight-hour-program',
      icon: <MonetizationOnIcon />,
      children: flightHourProgramRoutes,
      element: <FlightHourProgramTabLayout />,
      errorElement: <Oops />,
    },
    {
      label: 'Task Forces',
      path: 'task-forces',
      icon: <GroupsIcon />,
      children: taskForcesRoutes,
      element: <TabsLayout title="Task Forces" routes={taskForcesRoutes} />,
      errorElement: <Oops />,
    },
    {
      index: true,
      label: 'Account Management',
      path: 'profile',
      element: <AccountManagement />,
      errorElement: <Oops />,
    },
    {
      label: 'Support Center',
      path: 'support-center',
      icon: <SupportAgentIcon />,
      element: <SupportCenterPage />,
      errorElement: <Oops />,
    },
  );

  return routes;
}

/**
 * Admin Routes
 *
 * @important Routes must be set up the way for @see MainNavDrawer
 * @see MainNavDrawer routes are looped through to create NavLink's for navigation
 * Will only be visible to admins
 */

export const adminRoutes = get_admin_routes();

function get_admin_routes(): Array<RouteObject> {
  const adminRoutes: Array<RouteObject> = [
    {
      label: 'Equipment Transfer',
      path: 'equipment-transfer',
      icon: <ConnectingAirports />,
      children: equipmentTransferRoutes,
      element: <EquipmentTransferTabsLayout title="Equipment Transfer" />,
      errorElement: <Oops />,
    },
    {
      label: 'User Management',
      path: 'user-management',
      icon: <ManageAccountsIcon />,
      children: userManagementRoutes,
      element: <UserManagementTabsLayout title="User Management" />,
      errorElement: <Oops />,
    },
  ];

  return adminRoutes;
}

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
    errorElement: <Oops />,
    children: [
      ...routes,
      {
        label: 'app-admin',
        element: <AdminRoute />,
        children: adminRoutes,
      },
    ],
  },
  {
    label: 'Create Account',
    path: 'create-account',
    element: <CreateAccount />,
    errorElement: <Oops />,
  },
]);
