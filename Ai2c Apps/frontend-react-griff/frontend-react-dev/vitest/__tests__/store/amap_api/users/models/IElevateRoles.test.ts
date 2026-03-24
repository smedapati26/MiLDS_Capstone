import { describe, expect, it } from 'vitest';

import { IElevateRoles } from '@store/amap_api/users/models/IElevateRoles';

describe('IElevateRoles', () => {
  it('should have viewer, recorder, and manager as arrays of strings', () => {
    const roles: IElevateRoles = {
      viewer: ['user1', 'user2'],
      recorder: ['user3'],
      manager: ['user4', 'user5', 'user6'],
    };
    expect(Array.isArray(roles.viewer)).toBe(true);
    expect(Array.isArray(roles.recorder)).toBe(true);
    expect(Array.isArray(roles.manager)).toBe(true);
    expect(roles.viewer.every((item) => typeof item === 'string')).toBe(true);
    expect(roles.recorder.every((item) => typeof item === 'string')).toBe(true);
    expect(roles.manager.every((item) => typeof item === 'string')).toBe(true);
  });

  it('should match the IElevateRoles interface structure', () => {
    const roles: IElevateRoles = {
      viewer: [],
      recorder: [],
      manager: [],
    };
    expect(roles).toHaveProperty('viewer');
    expect(roles).toHaveProperty('recorder');
    expect(roles).toHaveProperty('manager');
  });
});
