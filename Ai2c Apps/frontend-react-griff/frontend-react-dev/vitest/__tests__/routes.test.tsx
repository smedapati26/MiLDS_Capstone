import { RouteObject } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { TabsLayout } from '@ai2c/pmx-mui/components';

import { componentManagementRoutes } from '@features/component-management/routes';
import { EquipmentManagerProvider } from '@features/equipment-manager/EquipmentManagerContext';
import { equipmentManagerRoutes } from '@features/equipment-manager/routes';
import TabsLayoutWrapper from '@features/equipment-manager/TabsLayoutWrapper';
import FlightHourProgramTabLayout from '@features/flight-hour-program/FlightHourProgramTabLayout';
import { flightHourProgramRoutes } from '@features/flight-hour-program/routes';
import { readinessAnalyticsRoutes } from '@features/readiness-analytics/routes';
import { taskForcesRoutes } from '@features/task-forces/routes';

import { routes } from '../../src/routes';

describe('routes configuration', () => {
  it('should have a root redirect route', () => {
    const rootRoute = routes.find((route) => route.index);
    expect(rootRoute).toBeDefined();
    expect(rootRoute?.loader).toBeDefined();
  });

  it('should have a maintenance schedule route', () => {
    const maintenanceRoute = routes.find((route: RouteObject) => route.path === 'maintenance-schedule');
    expect(maintenanceRoute).toBeDefined();
  });

  it('should have a readiness analytics route', () => {
    const readinessRoute = routes.find((route: RouteObject) => route.path === 'readiness-analytics');
    expect(readinessRoute).toBeDefined();
    expect(readinessRoute?.children).toEqual(readinessAnalyticsRoutes);
    expect(readinessRoute?.element).toEqual(
      <TabsLayout title="Readiness Analytics" routes={readinessAnalyticsRoutes} />,
    );
  });

  it('should have a task forces route', () => {
    const taskForcesRoute = routes.find((route: RouteObject) => route.path === 'task-forces');
    expect(taskForcesRoute).toBeDefined();
    expect(taskForcesRoute?.children).toEqual(taskForcesRoutes);
    expect(taskForcesRoute?.element).toEqual(<TabsLayout title="Task Forces" routes={taskForcesRoutes} />);
  });

  it('should have a component management route', () => {
    const componentManagementRoute = routes.find((route: RouteObject) => route.path === 'component-management');
    expect(componentManagementRoute).toBeDefined();
    expect(componentManagementRoute?.children).toEqual(componentManagementRoutes);

    expect(componentManagementRoute?.element).toEqual(
      <div id="component-management-container">
        <TabsLayout title="Component Management" routes={componentManagementRoutes} />
      </div>,
    );
  });

  it('should have a equipment manager route', () => {
    const equipmentManagerRoute = routes.find((route: RouteObject) => route.path === 'equipment-manager');
    expect(equipmentManagerRoute).toBeDefined();
    expect(equipmentManagerRoute?.children).toEqual(equipmentManagerRoutes);
    expect(equipmentManagerRoute?.element).toEqual(
      <div id="equipment-manager-container">
        <EquipmentManagerProvider>
          <TabsLayoutWrapper title="Equipment Manager" routes={equipmentManagerRoutes} />
        </EquipmentManagerProvider>
      </div>,
    );
  });
});

it('should have a flight hour program route', () => {
  const flightHourProgramRoute = routes.find((route: RouteObject) => route.path === 'flight-hour-program');
  expect(flightHourProgramRoute).toBeDefined();
  expect(flightHourProgramRoute?.children).toEqual(flightHourProgramRoutes);
  expect(flightHourProgramRoute?.element).toEqual(<FlightHourProgramTabLayout />);
});
