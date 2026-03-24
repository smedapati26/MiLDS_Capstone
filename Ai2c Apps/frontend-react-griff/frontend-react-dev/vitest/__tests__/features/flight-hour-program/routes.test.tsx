import { describe, expect, it } from 'vitest';

import { flightHourProgramRoutes } from '@features/flight-hour-program/routes';

describe('flightHourProgramRoutes', () => {
  it('show have empty routes', () => {
    const route = flightHourProgramRoutes.find((route) => route.path === '');
    expect(route).toBeDefined();
  });

  it('has routes for Overview', () => {
    const route = flightHourProgramRoutes.find((route) => route.path === 'overview');
    expect(route).toBeDefined();
  });

  // it('has routes for Calculator', () => {
  //   const route = flightHourProgramRoutes.find((route) => route.path === 'calculator');
  //   expect(route).toBeDefined();
  // });

  // it('has routes for Saved COAs', () => {
  //   const route = flightHourProgramRoutes.find((route) => route.path === 'saved-coas');
  //   expect(route).toBeDefined();
  // });
});
