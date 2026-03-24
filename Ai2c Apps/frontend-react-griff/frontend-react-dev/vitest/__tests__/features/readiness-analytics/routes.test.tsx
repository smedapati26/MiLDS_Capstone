import { describe, expect, it } from 'vitest';

import { readinessAnalyticsRoutes } from '@features/readiness-analytics/routes';

describe('readinessAnalyticsRoutes', () => {
  it('should have a route for Equipment', () => {
    const equipmentRoute = readinessAnalyticsRoutes.find((route) => route.path === 'equipment');
    expect(equipmentRoute).toBeDefined();
  });

  it('should have a route for Training', () => {
    const trainingRoute = readinessAnalyticsRoutes.find((route) => route.path === 'training');
    expect(trainingRoute).toBeDefined();
  });

  // it('should have a route for Personnel', () => {
  //   const personnelRoute = readinessAnalyticsRoutes.find((route) => route.path === 'personnel');
  //   expect(personnelRoute).toBeDefined();
  // });
});
