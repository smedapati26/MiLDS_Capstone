import { describe, expect, it } from 'vitest';

import { taskForcesRoutes } from '@features/task-forces/routes';

describe('taskForcesRoutes', () => {
  it('should have a route for Create New', () => {
    const overviewRoute = taskForcesRoutes.find((route) => route.path === 'create');
    expect(overviewRoute).toBeDefined();
  });

  it('should have a route for My Task Forces', () => {
    const equipmentRoute = taskForcesRoutes.find((route) => route.path === 'list');
    expect(equipmentRoute).toBeDefined();
  });

  it('should have a route for Archived Task Forces', () => {
    const trainingRoute = taskForcesRoutes.find((route) => route.path === 'archived');
    expect(trainingRoute).toBeDefined();
  });
});
