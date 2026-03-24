import { describe, expect, it } from 'vitest';

import { equipmentManagerRoutes } from '@features/equipment-manager/routes';

describe('equipmentManagerRoutes', () => {
  it('show have empty routes', () => {
    const route = equipmentManagerRoutes.find((route) => route.path === '');
    expect(route).toBeDefined();
  });

  it('show have routes for calendar', () => {
    const route = equipmentManagerRoutes.find((route) => route.path === 'aircraft');
    expect(route).toBeDefined();
  });

  it('show have routes for agse', () => {
    const route = equipmentManagerRoutes.find((route) => route.path === 'agse');
    expect(route).toBeDefined();
  });
});
