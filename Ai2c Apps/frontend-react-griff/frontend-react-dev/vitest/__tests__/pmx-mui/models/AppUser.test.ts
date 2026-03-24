import { describe, expect, it } from 'vitest';

import { AppUser, Preferences } from '@ai2c/pmx-mui/models/AppUser';

describe('AppUser Interface', () => {
  it('should create an AppUser with required properties', () => {
    const user: AppUser = {
      userId: '123',
      firstName: 'John',
      lastName: 'Doe',
      rank: 'Sergeant',
      isAdmin: true,
    };

    expect(user.userId).toBe('123');
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
    expect(user.rank).toBe('Sergeant');
    expect(user.isAdmin).toBe(true);
  });

  it('should create an AppUser with optional properties', () => {
    const preferences: Preferences = { mode: 'dark' };
    const user: AppUser = {
      userId: '123',
      firstName: 'John',
      lastName: 'Doe',
      rank: 'Sergeant',
      isAdmin: true,
      email: 'john.doe@example.com',
      preferences: preferences,
      unit: 'Unit 1',
      initials: 'JD',
    };

    expect(user.email).toBe('john.doe@example.com');
    expect(user.preferences).toEqual(preferences);
    expect(user.unit).toBe('Unit 1');
    expect(user.initials).toBe('JD');
  });

  it('should allow AppUser to be created without optional properties', () => {
    const user: AppUser = {
      userId: '123',
      firstName: 'John',
      lastName: 'Doe',
      rank: 'Sergeant',
      isAdmin: true,
    };

    expect(user.email).toBeUndefined();
    expect(user.preferences).toBeUndefined();
    expect(user.unit).toBeUndefined();
    expect(user.initials).toBeUndefined();
  });
});
